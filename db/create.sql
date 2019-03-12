drop table if exists review;
create table review
(
  id int not null auto_increment primary key,

  place varchar(128),
  item varchar(128),
  stars int,
  photo varchar(128),

  # unique(place,item),

  dt_created datetime default current_timestamp,
  dt_modified datetime on update current_timestamp
) ENGINE=MyISAM DEFAULT CHARSET=utf8
;

drop table if exists log;
create table log
(
  id int not null auto_increment primary key,
  review_id int not null,
  dt_created datetime default current_timestamp
# , foreign key (review_id) references review(id)
)
