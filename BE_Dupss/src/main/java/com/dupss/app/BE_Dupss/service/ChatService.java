package com.dupss.app.BE_Dupss.service;

import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.dupss.app.BE_Dupss.dto.request.ChatRequest;
import org.springframework.ai.chat.prompt.Prompt;

@Service
public class ChatService {
    private final OpenAiChatModel chatModel;

    @Autowired
    public ChatService(OpenAiChatModel chatModel) {
        this.chatModel = chatModel;
    }

    public String chat(ChatRequest request) {
        return chatModel.call(new Prompt(request.message())).getResult().getOutput().getText();
    }
} 