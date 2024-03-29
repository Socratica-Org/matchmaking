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

Develop the graph:

In the **graph/** directory

```sh
pnpm i
pnpm run dev
```

For Tailwind, concurrently:

```sh
pnpm run tailwind
```

Then open **graph/index.html** in a browser.

To serve:

```sh
pnpm start
```
