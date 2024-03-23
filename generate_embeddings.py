from typing import Optional

import numpy as np
import pandas as pd

import chromadb
from utils import chunk_array


def generate_embeddings():
    chroma_client = chromadb.PersistentClient(path="chromadb")
    time_prompt_collection = chroma_client.get_or_create_collection(
        name="time_prompt_embeddings")

    problem_prompt_collection = chroma_client.get_or_create_collection(
        name="problem_prompt_embeddings")

    # Load the CSV file into a Pandas DataFrame
    file_path = 'data.csv'
    df = pd.read_csv(file_path)
    df = df.replace({np.nan: None})  # Replace NaN with None

    # Lists to hold batch data
    time_prompts = []
    time_ids = []
    time_metadatas = []

    problem_prompts = []
    problem_ids = []
    problem_metadatas = []

    # Iterate over DataFrame to accumulate batch data
    for index, row in df.iterrows():
        api_id = row['api_id']
        name = row['name']
        email = row['email']
        program: Optional[str] = row.iloc[21]

        time_prompt: Optional[str] = row.iloc[23]
        problem_prompt: Optional[str] = row.iloc[24]

        # Accumulate time_prompt data
        if time_prompt:
            time_prompts.append(time_prompt)
            time_ids.append(api_id)
            time_metadatas.append({
                "name": name,
                "email": email,
                "program": program or "N/A",
            })

        # Accumulate problem_prompt data
        if problem_prompt:
            problem_prompts.append(problem_prompt)
            problem_ids.append(api_id)
            problem_metadatas.append({
                "name": name,
                "email": email,
                "program": program or "N/A",
            })

        print(f"{index}: Processed {name}")

    print("Performing batch upserts...")

    # Split batch data into smaller chunks of 20 participants each
    chunk_size = 5
    time_prompts = chunk_array(time_prompts, chunk_size)
    time_ids = chunk_array(time_ids, chunk_size)
    time_metadatas = chunk_array(time_metadatas, chunk_size)

    problem_prompts = chunk_array(problem_prompts, chunk_size)
    problem_ids = chunk_array(problem_ids, chunk_size)
    problem_metadatas = chunk_array(problem_metadatas, chunk_size)

    for i in range(len(time_prompts)):
        time_prompt_collection.upsert(
            ids=time_ids[i],
            documents=time_prompts[i],
            metadatas=time_metadatas[i])
        print(
            f"Finished {len(time_prompts[i])} time prompts ({i+1}/{len(time_prompts)})")

    for i in range(len(problem_prompts)):
        problem_prompt_collection.upsert(
            ids=problem_ids[i],
            documents=problem_prompts[i],
            metadatas=problem_metadatas[i])
        print(
            f"Finished {len(problem_prompts[i])} problem prompts ({i+1}/{len(problem_prompts)})")


if __name__ == '__main__':
    generate_embeddings()
