import chromadb


def main():
    chroma_client = chromadb.PersistentClient(path="chromadb")
    time_prompt_collection = chroma_client.get_or_create_collection(
        name="time_prompt_embeddings")

    problem_prompt_collection = chroma_client.get_or_create_collection(
        name="problem_prompt_embeddings")

    query = "I can't stop thinking about how we all are just conditioned to follow the textbook from school so everyone just accepts there is a 'right way' to go about life. We need to have stronger opinions on a different future where people are more inclined to follow things that are out of the ordinary"

    results = problem_prompt_collection.query(
        query_texts=[
            query
        ],
        n_results=5,
        include=["documents", "distances", "metadatas"]
    )

    print(f"Queried top results for '{query}'\n")

    for i in range(len(results["ids"][0])):
        print(f"ID: {results['ids'][0][i]}")
        print(f"Name: {results['metadatas'][0][i]['name']}")
        print(f"Program: {results['metadatas'][0][i]['program']}")
        print(f"Response: {results['documents'][0][i]}")
        print(f"Distance: {results['distances'][0][i]}")
        # print(f"Metadata: {results['metadatas'][0][i]}")
        print()


if __name__ == '__main__':
    main()
