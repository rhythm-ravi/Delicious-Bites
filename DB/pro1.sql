CREATE DATABASE prodb;
use prodb;


create table users (
	id INT NOT NULL AUTO_INCREMENT,
    mobile_number INT NOT NULL CHECK (mobile_number BETWEEN 1000000000 AND 9999999999),
    password varchar(30) CHECK ( CHAR_LENGTH(password) >= 8 ),
    primary key (id),
    unique key (mobile_number)
);
select * from users;
truncate users;
desc users;

insert into users values (100, 100, "abc");