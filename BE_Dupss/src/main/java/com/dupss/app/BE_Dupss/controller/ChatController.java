package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.ChatRequest;
import com.dupss.app.BE_Dupss.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public String chat(@RequestBody ChatRequest request) {
        return chatService.chat(request);
    }
} 