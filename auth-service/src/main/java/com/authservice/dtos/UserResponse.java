package com.authservice.dtos;

import java.io.Serializable;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponse implements Serializable {
    private String fullName;
    private String email;
    public UserResponse(String fullName, String email) {
        this.fullName = fullName;
        this.email = email;
    }
}
