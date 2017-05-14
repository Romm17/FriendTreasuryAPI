package service;

import domain.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import repository.UserRepository;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

/**
 * Created by romm on 28.02.17.
 */
@Service("springUserService")
@Qualifier("springUserServiceBean")
public class SpringUserService implements UserService {

    @Autowired
    UserRepository userRepository;

    @Override
    public void init() {
        createUser(new User("380952411401", "Roma", "111"));
        createUser(new User("380952411402", "Bodya", "111"));
        createUser(new User("380960737750", "Jura", "111"));
        createUser(new User("380952411403", "Geka", "111"));
    }

//    @Override
//    public List<User> initTreasury(List<String> usernames) {
//        List<User> users = new LinkedList<>();
//        for (String username : usernames) {
//            User u = new User(username);
//            u = userRepository.save(u);
//            users.add(u);
//        }
//        return users;
//    }

    @Override
    public User getUserByID(Integer id) {
        return userRepository.findOne(id);
    }

    @Override
    public void createUser(User user) {
        user.setPassword(MD5Encrypter.encrypt(user.getPassword()));
        userRepository.save(user);
    }

    @Override
    public boolean validateUser(User user) {
        List<User> users = userRepository.findUserByUsername(user.getUsername());
        if (users.size() < 1) {
            return false;
        }
        User trueUser = users.get(0);
        return Objects.equals(trueUser.getPassword(), MD5Encrypter.encrypt(user.getPassword()));
    }

}
