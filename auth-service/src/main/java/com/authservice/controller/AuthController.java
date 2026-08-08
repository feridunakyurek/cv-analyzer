package com.authservice.controller;

import com.authservice.dtos.*;
import com.authservice.entities.User;
import com.authservice.services.AuthService;
import com.authservice.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();

        User user = userService.getUserByEmail(email);

        String name = (user.getName() != null) ? user.getName() : "";
        String surname = (user.getSurname() != null) ? user.getSurname() : "";
        String fullName = (name + " " + surname).trim();

        if(fullName.isEmpty()){
            fullName = "Kullanıcı";
        }

        UserResponse userResponse = new UserResponse(fullName, user.getEmail());

        return ResponseEntity.ok(userResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@RequestBody @Valid UserRegistrationRequest request) {

        JwtResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<String> deleteAccount(Authentication authentication) {
        userService.deleteUser(authentication.getName());
        return ResponseEntity.ok("Hesabınız ve tüm verileriniz başarıyla silindi.");
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        try{
            userService.changePassword(
                    authentication.getName(),
                    request.getCurrentPassword(),
                    request.getNewPassword());
            return ResponseEntity.ok("Şifreniz değiştirildi.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }

}
