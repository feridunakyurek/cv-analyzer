package com.authservice.services;

import com.authservice.dtos.AuthRequest;
import com.authservice.dtos.JwtResponse;
import com.authservice.dtos.UserRegistrationRequest;
import com.authservice.entities.Role;
import com.authservice.entities.User;
import com.authservice.exceptions.UserAlreadyExistsException;
import com.authservice.repos.UserRepository;
import com.authservice.security.JwtUtil;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       @Lazy PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı"));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }

    public JwtResponse register(UserRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists!");
        }

        User newUser = new User();
        newUser.setName(request.getName());
        newUser.setSurname(request.getSurname());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRole(Role.USER);

        User savedUser = userRepository.save(newUser);  // ← save sonucu alınıyor

        String token = jwtUtil.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );

        return new JwtResponse(token);
    }

    public JwtResponse login(AuthRequest request) {
        if(request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new RuntimeException("Şifre boş olamaz.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Kullanıcı Bulunamadı"));
         if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
             throw new RuntimeException("Geçersiz Şifre");
         }

         String token = jwtUtil.generateToken(
                 user.getId(),
                 user.getEmail(),
                 user.getRole().name()
         );

         return new JwtResponse(token);
    }

    public User registerAdmin(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.ADMIN);
        return userRepository.save(user);
    }
}