# Matchmaking Tools

### Download participant data

In lu.ma, go to your event page and click "Manage". Click "Guests" and click the download button to get the CSV file. Put this in the root directory of this repository as "**data.csv**"

### Running the script

Install dependencies

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Generate embeddings

```sh
python generate_embeddings.py
```
