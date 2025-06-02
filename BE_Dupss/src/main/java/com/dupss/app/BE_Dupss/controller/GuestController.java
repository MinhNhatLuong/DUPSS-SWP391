package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.RegisterRequest;
import com.dupss.app.BE_Dupss.dto.response.RegisterResponse;
import com.dupss.app.BE_Dupss.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/public")
public class GuestController {

    private final UserService userService;

    @PostMapping("/register")
    public RegisterResponse createUser(@RequestBody RegisterRequest request) {
        return userService.createUser(request);
    }


}
