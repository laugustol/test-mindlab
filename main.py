from fastapi import FastAPI
from openai import OpenAI
import os
from dotenv import load_dotenv
from pydantic import BaseModel
import time
from starlette.middleware.cors import CORSMiddleware

load_dotenv()

client = OpenAI(api_key = os.getenv('OPENAI_API_KEY'))
ASSISTANT_ID = os.getenv('ASSISTANT_ID')

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    thread_id: str
    message: str

@app.post("/start-thread/")
async def start_thread():
    thread = client.beta.threads.create()
    return {"thread_id": thread.id}

@app.post("/receive-query/")
async def receive_query(query:Query):
    client.beta.threads.messages.create(thread_id=query.thread_id,role="user",content=query.message)
    run = client.beta.threads.runs.create(thread_id=query.thread_id, assistant_id=ASSISTANT_ID)
    while run.status != "completed":
        run = client.beta.threads.runs.retrieve(thread_id=query.thread_id, run_id=run.id)
        print(f"statues run: {run.status}")
        time.sleep(1)
    else:
        print(f"run status completed")
        
    message_response = client.beta.threads.messages.list(thread_id=query.thread_id)
    messages = message_response.data
    latest_message = messages[0]
    return {"response": latest_message.content[0].text.value}

