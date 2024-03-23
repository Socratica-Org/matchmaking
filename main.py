import chromadb


def main():
    chroma_client = chromadb.PersistentClient(path="chromadb")
    time_prompt_collection = chroma_client.get_or_create_collection(
        name="time_prompt_embeddings")

    problem_prompt_collection = chroma_client.get_or_create_collection(
        name="problem_prompt_embeddings")

    # query
    print(time_prompt_collection.query(
        query_texts=["robotics"],
        n_results=5,
        include=["documents", "distances", "metadatas"]
    ))

    print(problem_prompt_collection.query(
        query_texts=["urbanism, walkable cities, public transportation"],
        n_results=5,
        include=["documents", "distances", "metadatas"]
    ))


if __name__ == '__main__':
    main()
