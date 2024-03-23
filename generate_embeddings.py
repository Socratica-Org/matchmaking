from typing import Optional

import numpy as np
import pandas as pd

import chromadb

# Save embedding data locally


def generate_embeddings():
    chroma_client = chromadb.PersistentClient(path="chromadb")
    time_prompt_collection = chroma_client.get_or_create_collection(
        name="time_prompt_embeddings")

    problem_prompt_collection = chroma_client.get_or_create_collection(
        name="problem_prompt_embeddings")

    # Load the CSV file into a Pandas DataFrame
    # Replace 'your_file.csv' with the path to your CSV file
    file_path = 'data.csv'
    df = pd.read_csv(file_path)
    df = df.replace({np.nan: None})  # Replace no response with None

    # For each luma participant
    for index, row in df.iterrows():
        # Concatenate the values from the selected columns
        api_id = row['api_id']
        name = row['name']
        email = row['email']

        # May need to adjust numbers for your data
        program: Optional[str] = row.iloc[21]

        # If you had no other obligations, what would you spend your time trying/creating? (we use this to match you with other attendees! more detail = better match :) )
        time_prompt: Optional[str] = row.iloc[23]

        # What are the problems you can't stop thinking about?
        problem_prompt: Optional[str] = row.iloc[24]

        if time_prompt:
            time_prompt_collection.upsert(
                ids=[api_id],
                documents=[time_prompt],  # Added a closing parenthesis here
                metadatas=[{
                    "name": name,
                    "email": email,
                    "program": program or "N/A",
                }])

        if problem_prompt:
            problem_prompt_collection.upsert(
                ids=[api_id],
                documents=[problem_prompt],  # Added a closing parenthesis here
                metadatas=[{
                    "name": name,
                    "email": email,
                    "program": program or "N/A",
                }])

        print(f"{index}: Processed {name}")


if __name__ == '__main__':
    generate_embeddings()
