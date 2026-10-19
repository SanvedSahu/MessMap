package com.messmap.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;

/**
 * Exception thrown when a client request is invalid or violates business logic rules.
 */
@Getter
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {

    private final List<String> details;

    public BadRequestException(String message) {
        super(message);
        this.details = null;
    }

    public BadRequestException(String message, List<String> details) {
        super(message);
        this.details = details;
    }
}
