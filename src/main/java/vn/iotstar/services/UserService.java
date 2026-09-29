package vn.iotstar.services;

import org.springframework.stereotype.Service;
import vn.iotstar.models.UserResponse;
import vn.iotstar.repository.UserRepository;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> allUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::fromUser)
                .toList();
    }
}
