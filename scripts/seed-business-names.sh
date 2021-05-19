DEFAULT_DB_NAME=businesslocal
DB_NAME="${1:-$DEFAULT_DB_NAME}"
DB_URL=postgresql://postgres@localhost/${DB_NAME}

psql -c "insert into businesses (name) values ('       A FRIEND IN NEED IS A FRIEND INDEED A NJ NONPROFIT CORPORATION');" -d $DB_URL
psql -c "insert into businesses (name) values ('       ALL CAR AUTO GROUP LIMITED LIABILITY COMPANY');" -d $DB_URL
psql -c "insert into businesses (name) values ('       GLOBAL VILLAGE EDUCATION COLLABORATIVE A NJ NONPROFIT CORPORATION');" -d $DB_URL
psql -c "insert into businesses (name) values ('       ROCK N'' ROLL BALL LIMITED LIABILITY COMPANY');" -d $DB_URL
psql -c "insert into businesses (name) values ('       TRANSMARKET SOLUTION  LIMITED LIABILITY COMPANY');" -d $DB_URL
psql -c "insert into businesses (name) values ('  VINELAND GENERAL, INC. II');" -d $DB_URL
psql -c "insert into businesses (name) values (' GARCIA & GARCIA ASSOCIATES, LLC');" -d $DB_URL
psql -c "insert into businesses (name) values (' HARMONY PROPERTIES, INC.');" -d $DB_URL
psql -c "insert into businesses (name) values (' R & RAR INC.');" -d $DB_URL
psql -c "insert into businesses (name) values ('2815 CARMAN STREET, L.L.C.');" -d $DB_URL
psql -c "insert into businesses (name) values ('300 BORDENTOWN HS WEST 33RD LLC');" -d $DB_URL
psql -c "insert into businesses (name) values ('A AND B MEDICAL. LLC');" -d $DB_URL
psql -c "insert into businesses (name) values ('A-1 HALAL MEAT MARKET, LLC');" -d $DB_URL
psql -c "insert into businesses (name) values ('ACULYST CORP.');" -d $DB_URL
psql -c "insert into businesses (name) values ('ADHERIS, INC.');" -d $DB_URL
psql -c "insert into businesses (name) values ('AIGUA MANAGEMENT, INC.');" -d $DB_URL
psql -c "insert into businesses (name) values ('ALL GOOD ERA, LLC');" -d $DB_URL
psql -c "insert into businesses (name) values ('ALLEGIANT PARTNERS INCORPORATED');" -d $DB_URL
psql -c "insert into businesses (name) values ('AMBULATORY SURGICAL CENTER OF MORRIS COUNTY, INC.');" -d $DB_URL
psql -c "insert into businesses (name) values ('ASPECT FUTURESACCESS LLC');" -d $DB_URL
psql -c "insert into businesses (name) values ('BARB''S BOOKKEEPING SERVICES, LLC');" -d $DB_URL
psql -c "insert into businesses (name) values ('BASECAP ANALYTICS INC.');" -d $DB_URL
psql -c "insert into businesses (name) values ('BEACH BOUTIQUE AT ANGLER''S MARINA LLC');" -d $DB_URL
psql -c "insert into businesses (name) values ('BEAR STAFFING SERVICES CORPORATION');" -d $DB_URL
psql -c "insert into businesses (name) values ('BELMAC ENTERPRISES, LLC');" -d $DB_URL
psql -c "insert into businesses (name) values ('BMS AUTO LLC');" -d $DB_URL
psql -c "insert into businesses (name) values ('BRB NORTH AMERICA, INC.');" -d $DB_URL
psql -c "insert into businesses (name) values ('BRINKER NEW JERSEY, INC.');" -d $DB_URL
psql -c "insert into businesses (name) values ('BRINKER RESTAURANT CORPORATION');" -d $DB_URL
psql -c "insert into businesses (name) values ('BROADCAST MUSIC, INC.');" -d $DB_URL