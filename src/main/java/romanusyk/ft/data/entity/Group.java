package romanusyk.ft.data.entity;

import lombok.*;
import org.hibernate.validator.constraints.Length;
import org.hibernate.validator.constraints.NotEmpty;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * Created by romm on 28.08.17.
 */
@Entity
@Table(name = "pgroups")
@Builder
@AllArgsConstructor
@Getter
@Setter
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.TABLE)
    private Integer id;

    @NotEmpty
    @Column(nullable = false, length = 100)
    private String title;

    @Length
    @Column(nullable = false, unique = true, length = 21)
    private String name;

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.PERSIST)
    @JoinTable(name = "pgroup_user")
    @Builder.Default
    private Set<User> users = new HashSet<>();

    public Group() {
        users = new HashSet<>();
    }

    public void updateFromInstance(Group group) {
        if (group.name != null) {
            this.name = group.name;
        }
        if (group.title != null) {
            this.title = group.title;
        }
    }

    @Override
    public String toString() {
        return String.format(
                "{id: %d, title: \"%s\"}",
                id,
                title
        );
    }

    public String toDetailedString() {
        return String.format(
                "{id: %d, title: \"%s\", users: %s}",
                id,
                title,
                users.toString()
        );
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof Group) {
            Group that = (Group) obj;
            return !(this.id == null || that.id == null) && this.id.equals(that.id);
        }
        return false;
    }

    @Override
    public int hashCode() {
        return id == null ? 0 : id;
    }

}
