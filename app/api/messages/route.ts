import { NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const MESSAGES_FILE_PATH = path.join(process.cwd(), 'data', 'messages.json');
const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDirectory() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

// Read messages from file
async function readMessages() {
  try {
    await ensureDataDirectory();
    if (!existsSync(MESSAGES_FILE_PATH)) {
      await writeFile(MESSAGES_FILE_PATH, JSON.stringify([]));
      return [];
    }
    const data = await readFile(MESSAGES_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading messages:', error);
    return [];
  }
}

// Write messages to file
async function writeMessages(messages: any[]) {
  try {
    await ensureDataDirectory();
    await writeFile(MESSAGES_FILE_PATH, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error('Error writing messages:', error);
    throw error;
  }
}

// Content filtering function
function filterNegativeContent(content: string): boolean {
  const negativeWords = [
    'hate', 'stupid', 'dumb', 'idiot', 'loser', 'pathetic', 'worthless',
    'kill yourself', 'die', 'suicide', 'hurt yourself', 'self-harm',
    'ugly', 'fat', 'disgusting', 'terrible', 'awful', 'horrible'
  ];
  
  const lowerContent = content.toLowerCase();
  return !negativeWords.some(word => lowerContent.includes(word));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('user');
    const otherUserEmail = searchParams.get('other');

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 });
    }

    const messages = await readMessages();
    let filteredMessages = messages;

    // If other user specified, get conversation between the two users
    if (otherUserEmail) {
      filteredMessages = messages.filter((message: any) => 
        (message.sender_email === userEmail && message.recipient_email === otherUserEmail) ||
        (message.sender_email === otherUserEmail && message.recipient_email === userEmail)
      );
    } else {
      // Get all messages involving the user
      filteredMessages = messages.filter((message: any) => 
        message.sender_email === userEmail || message.recipient_email === userEmail
      );
    }

    return NextResponse.json(filteredMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sender_email, recipient_email, content } = body;

    if (!sender_email || !recipient_email || !content) {
      return NextResponse.json({ 
        error: 'Sender email, recipient email, and content are required' 
      }, { status: 400 });
    }

    // Filter negative content
    if (!filterNegativeContent(content)) {
      return NextResponse.json({ 
        error: 'Message contains inappropriate content. Please keep messages positive and supportive.' 
      }, { status: 400 });
    }

    const messages = await readMessages();
    
    const newMessage = {
      id: Date.now().toString(),
      sender_email,
      recipient_email,
      content: content.trim(),
      created_at: new Date().toISOString(),
      is_read: false
    };

    messages.push(newMessage);
    await writeMessages(messages);

    return NextResponse.json({ 
      message: 'Message sent successfully',
      data: newMessage 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { message_id, is_read } = body;

    if (!message_id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const messages = await readMessages();
    const messageIndex = messages.findIndex((msg: any) => msg.id === message_id);

    if (messageIndex === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    messages[messageIndex] = {
      ...messages[messageIndex],
      is_read: is_read !== undefined ? is_read : true
    };

    await writeMessages(messages);

    return NextResponse.json({ 
      message: 'Message updated successfully',
      data: messages[messageIndex]
    });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}