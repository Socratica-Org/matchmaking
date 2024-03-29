import os

# Load from .env
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

if "OPENAI_API_KEY" not in os.environ:
    raise Exception("API key not found")


client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"]
)

example_messages = [
    {
        "role": "system",
        "content": "You are an assistant who is to take participant responses answering the question: \"If you had no other obligations, what would you spend your time trying/creating\" and summarize them in a concise, 1-2 sentence abstract.\n\nYou should give your response beginning with the word \"Would\", similar to the following forms:\n\n1) Would create ______\n2) Would make ______"
    },
    {
        "role": "user",
                "content": "Summarize response: \"Learning and working with embedded projects interfacing with AI\"\n"
    },
    {
        "role": "assistant",
                "content": "Would learn and work on embedded projects interfacing with AI"
    },
    {
        "role": "user",
                "content": "Summarize: \"I have been meaning to connect with community organizations/ngos I'm tied to, about campaigns promoting longevity of girls in sports and programs that promoting healthy coaching approaches for girls in high performance training. This is an important cause for me since most girls abandon their sport after adolescence, there are big systematic differences and disparity in opportunities to pursue professional careers - and i just want girls to feel fulfilled through sport. Also I've recently been into metal crafts and jewelry making by repurposing scraps and unconventional pieces to make something wearable. I also enjoy making embroidery and hand textiles projects. So many half-started crafts projects I could mention.\""
    },
    {
        "role": "assistant",
                "content": "Would connect with community organizations promoting girls in sports and jewelry making by repurposing scraps"
    },
    {
        "role": "user",
                "content": "Summarize: \"Music\"\n"
    },
    {
        "role": "assistant",
                "content": "Would work on music"
    },
    {
        "role": "user",
                "content": "Summarize: \"Building schools or skateparks in Nigeria and neighboring countries. And sending millions to Congo and Palestine\"\n"
    },
    {
        "role": "assistant",
                "content": "Would build schools or skateparks in Nigeria and send millions to Congo and Palestine"
    },
    {
        "role": "user",
                "content": "Summarize: \"I would love to dive into learning robotics. I have ideas about how robots can be applied and commercialized but I have no experience with that type of hardware yet.\""
    },
    {
        "role": "assistant",
                "content": "Would dive into learning robotics, with my ideas on how robots can be applied and commercialized"
    },
    {
        "role": "user",
                "content": "Summarize: \"Healthcare/biotech community, music label, content house\""
    },
    {
        "role": "assistant",
                "content": "Would create a healthcare/biotech community, a music label, and a content house."
    },
    {
        "role": "user",
                "content": "Summarize: \"Visiting small towns in rural Canada to learn more about how they see the future, which problems are on their mind, etc.\""
    },
    {
        "role": "assistant",
                "content": "Would visit small towns in rural Canada to learn more about how they see their future and their problems"
    },
    {
        "role": "user",
                "content": "Summarize: \"I'd want to work on something to help people live up to their true potential, to make the best of the time we have. I want to help people be more fulfilled and happier in their day-to-day lives.\""
    },
    {
        "role": "assistant",
                "content": "Would work on a project to help people live up to their true potential for a more fulfilled and happier life."
    },
    {
        "role": "user",
                "content": "Summarize: \"With no obligations, would: I have been tackling the problem of finding better matches for peer-tutor pairs. For all large-scale tutoring platforms such as Chegg, Khan Academy, etc, there are no features that recommend tutors to users based on their individual needs. On the other hand, in-person tutoring institutions including Kumon, private tutors, and services offered by schools create pairings based on heuristics; not considering a student's unique learning profile. If I had no other obligations (school, clubs, etc), I would go head-on into discussing these issues with current individuals in the tutoring scene. I have already been developing a platform to algorithmically find the most compatible matches for students and tutors, however progress is not steady as there are other obligations that cause priorities to change.\""
    },
    {
        "role": "assistant",
                "content": "Would engage fully in developing a platform that algorithmically finds the most compatible matches for students and tutors in large-scale tutoring platforms."
    },
    {
        "role": "user",
                "content": "Summarize: \"With no obligations, would: Travel around the world, take pictures and videos, play and record and publish music\""
    },
    {
        "role": "assistant",
                "content": "Would travel around the world, take pictures and videos, and publish music"
    },
    {
        "role": "user",
                "content": "Summarize: \"Working on ai personal assistant google chrome extension. Looking for interesting projects to join in as a SWE\""
    },
    {
        "role": "assistant",
                "content": ""
    },
    {
        "role": "assistant",
                "content": "Would work on an AI personal assistant Google Chrome extension and seek interesting projects to join as a Software Engineer."
    },
    {
        "role": "user",
                "content": "Summarize: \"With no obligations, would: I would love to work with scientists and engineers on exciting scientific problem spaces (quantum computing, AI, etc) to introduce new advancements in these areas. For example, experimenting with new methodologies and technology to study black holes and the universe better is fascinating to me.\""
    },
    {
        "role": "assistant",
                "content": "Would work with scientists and engineers on advancements on scientific problem spaces like quantum computing, AI, and astronomical studies."
    },
    {
        "role": "user",
                "content": "Summarize: \"With no obligations, would: I will work on different projects on different technologies like blockchain, machine learning and mobile development. Creating such applications will strengthen my hold on the basics and expose me to practical examples.\""
    },
    {
        "role": "assistant",
                "content": "Would work on various projects involving technologies such as blockchain, machine learning, and mobile development to strengthen basic skills and gain practical experience."
    },
    {
        "role": "user",
                "content": "Summarize: \"With no obligations, would: i'd spend time researching whatever topics I feel like in STEM, humanities, social sciences, and i'd also make bad art: music, film, drawings\""
    },
    {
        "role": "assistant",
                "content": "Would spend time researching topics across STEM, humanities, social sciences, and create experimental music, film, and drawings."
    },
    {
        "role": "user",
                "content": "Summarize: \"With no obligations, would: A tech venture idea that can make a social impact\""
    },
    {
        "role": "assistant",
                "content": "Would create a tech venture that can make a social impact."
    }
]


def generate_summary(response: str) -> str:
    last_prompt = f"Summarize: \"{response}\"\n"

    # Create a NEW array with the examples messages and the last prompt
    new_example_messages = example_messages + \
        [{"role": "user", "content": last_prompt}]

    chat_response = client.chat.completions.create(
        model="gpt-4",
        messages=new_example_messages,
        temperature=1,
        max_tokens=40,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    return chat_response.choices[0].message.content


if __name__ == "__main__":
    res = generate_summary(
        "A game")
    print(res)
