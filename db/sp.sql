drop procedure if exists set_photo;
delimiter //
create procedure set_photo(_review_id int, _photo varchar(255))
begin
  update review
  set photo=_photo
  where id = _review_id;
end //
delimiter ;

drop procedure if exists set_place;
delimiter //
create procedure set_place(_review_id int, _place varchar(255))
begin
  update review
  set place=_place
  where id = _review_id;
end //
delimiter ;

drop procedure if exists set_item;
delimiter //
create procedure set_item(_review_id int, _item varchar(255))
begin
  update review
  set item=_item
  where id = _review_id;
end //
delimiter ;

drop procedure if exists set_stars;
delimiter //
create procedure set_stars(_review_id int, _stars int)
begin
  update review
  set stars=_stars
  where id = _review_id;
end //
delimiter ;

drop procedure if exists get_log;
delimiter //
create procedure get_log (_place varchar(255), _item varchar(255))
begin
  select log.id as log_id, log.review_id, date(log.dt_created) as date, log.dt_created as datetime, review.place, review.item, review.photo, review.stars
  from log
  join review on review.id = log.review_id
  where (_place is null or _place = '' or _place = review.place) and
       (_item is null or _item = '' or _item = review.item)
  order by date;
end //
delimiter ;

drop procedure if exists get_reviews;
delimiter //
create procedure get_reviews(_place varchar(255), _item varchar(255))
begin
    set @review_id = (select min(review_id) from log);
    set @t0 = (select min(dt_created) from log where review_id=@review_id);
    drop temporary table if exists deltas;
    create temporary table deltas as
    select review_id,
        case when @review_id != review_id then 0 else
        unix_timestamp(dt_created) - unix_timestamp(@t0) end as delta,
        @t0 := dt_created,
        @review_id := review_id
    from log
    order by review_id, dt_created
    ;

    drop temporary table if exists delta;
    create temporary table delta as
    select review_id, cast(avg(delta) as signed) as avg_delta
    from deltas
    where delta != 0
    group by review_id
    ;

    drop temporary table if exists since_last;
    create temporary table since_last as
    select
      review_id,
      max(dt_created) as last_time,
      unix_timestamp(now()) - unix_timestamp(max(dt_created)) as since_last
    from log
    group by review_id
    ;

    select
      review.*,
      avg_delta,
      since_last,
      ifnull(least(100, since_last * 100 / avg_delta),0) as freshness,
      last_time,
      DATE(last_time) as last_day
    from review
    left join delta on delta.review_id = review.id
    left join since_last on since_last.review_id = review.id
    where (_place = '' or _place = place)
    and (_item = '' or _item = item)
    order by least(100, since_last * 100 / avg_delta), last_time
    ;
end //
delimiter ;

drop procedure if exists get_reviews2;
delimiter //
create procedure get_reviews2(dummy int)
begin
  select * from review
  order by id desc;
end //
delimiter ;

drop procedure if exists create_new_review;
delimiter //
create procedure create_new_review(dummy varchar(1))
begin
  insert into review
  (place, photo, item, stars)
  values
  ('','','',3);

  select * from review
  where id=LAST_INSERT_ID();

end //
delimiter ;

drop procedure if exists delete_review;
delimiter //
create procedure delete_review(_review_id int)
begin
  delete from review
  where id=_review_id;
end //
delimiter ;

drop procedure if exists log_review;
delimiter //
create procedure log_review(_review_id int)
begin
  insert into log (review_id) values (_review_id);
end //
delimiter ;

drop procedure if exists set_date;
delimiter //
create procedure set_date(_log_id int, _date varchar(64))
begin
  update log
  set dt_created = _date
  where id = _log_id;
end //
delimiter ;