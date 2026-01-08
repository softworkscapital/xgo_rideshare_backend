

"/update_driverstatus_datetime_analytics_neworder/:trip_id"

"/update_driverstatus_datetime_analytics_counteroffer/:trip_id"

"/update_driverstatus_datetime_analytics_intransit/:trip_id"

"/update_driverstatus_datetime_analytics_arrivedatdestination/:trip_id"


"/update_driverstatus_datetime_analytics_tripended/:trip_id"


"/update_driverstatus_datetime_analytics_estimatedduration/:trip_id"

"/update_driverstatus_datetime_analytics_actualduration/:trip_id"






"ALL USERS = SELECT user_id FROM users ",
"let total_user_balances = 0"
"let each_acc_record = 0"
"MAP(ALL USERS){ "
"each_acc_record= SELECT client_profile_id, balance FROM top_up ORDER BY top_up_id DESC LIMIT 1"
"total_user_balances = total_user_balances + each_acc_record}"