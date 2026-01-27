require('dotenv').config()
const pool = require('./poolfile')

let crudsObj = {}

crudsObj.postTrip = (
  driver_id,
  cust_id,
  request_start_datetime,
  order_start_datetime,
  order_end_datetime,
	estimate_order_end_datetime,
  status,
  deliveray_details,
  delivery_notes,
  weight,
  delivery_contact_details,
  dest_location,
  origin_location,
  origin_location_lat,
  origin_location_long,
  destination_lat,
  destination_long,
  distance,
  delivery_cost_proposed,
  accepted_cost,
  paying_when,
  payment_type,
  preferred_gender,
  preferred_car_type,
  preferred_age,
  number_of_passengers,
  driver_license_date,
  currency_id,
  currency_code,
  usd_rate,
  customer_comment,
  driver_comment,
  driver_stars,
  customer_stars,
  customer_status,
  pascel_pic1,
  pascel_pic2,
  pascel_pic3,
  trip_priority_type,
  delivery_received_confirmation_code,
  commercial_value_delivery_category
) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO trip (
             driver_id, cust_id, request_start_datetime, order_start_datetime,
             order_end_datetime, estimate_order_end_datetime,status, deliveray_details, delivery_notes, weight, 
             delivery_contact_details, dest_location, origin_location, 
             origin_location_lat, origin_location_long, destination_lat, 
             destination_long, distance, delivery_cost_proposed, 
             accepted_cost, paying_when, payment_type, preferred_gender, 
             preferred_car_type, preferred_age, number_of_passengers, 
             driver_license_date,
             currency_id, currency_code, usd_rate, customer_comment, driver_comment,
              driver_stars, customer_stars, customer_status, pascel_pic1, pascel_pic2, pascel_pic3, trip_priority_type, delivery_received_confirmation_code, commercial_value_delivery_category
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        driver_id,
        cust_id,
        request_start_datetime,
        order_start_datetime,
        order_end_datetime,
        estimate_order_end_datetime,
        status,
        deliveray_details,
        delivery_notes,
        weight,
        delivery_contact_details,
        dest_location,
        origin_location,
        origin_location_lat,
        origin_location_long,
        destination_lat,
        destination_long,
        distance,
        delivery_cost_proposed,
        accepted_cost,
        paying_when,
        payment_type,
        preferred_gender,
        preferred_car_type,
        preferred_age,
        number_of_passengers,
        driver_license_date,
        currency_id,
        currency_code,
        usd_rate,
        customer_comment,
        driver_comment,
        driver_stars,
        customer_stars,
        customer_status,
        pascel_pic1,
        pascel_pic2,
        pascel_pic3,
        trip_priority_type,
        delivery_received_confirmation_code,
        commercial_value_delivery_category
      ],
      (err, result) => {
        if (err) {
          console.error('Error occurred during SQL query:', err)
          return reject(err)
        }
        return resolve({ status: '200', message: 'Saving successful' })
      }
    )
  })
}



crudsObj.getTrips = () => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM trip ORDER BY trip_id DESC', (err, results) => {
      if (err) {
        return reject(err)
      }
      return resolve(results)
    })
  })
}

// New method to get funnel analysis data for tracking user journey
crudsObj.getFunnelAnalysis = (period = 'today') => {
  return new Promise((resolve, reject) => {
    let dateFilter = '';
    let rideshareDateFilter = '';
    if (period === 'today') {
      dateFilter = 'AND DATE(request_start_datetime) = CURDATE()';
      rideshareDateFilter = 'AND DATE(created_at) = CURDATE()';
    } else if (period === 'week') {
      dateFilter = 'AND request_start_datetime >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      rideshareDateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      dateFilter = 'AND request_start_datetime >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
      rideshareDateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    const overviewQuery = `
      -- Private Rides Overview
      SELECT 
        'private_search' as stage,
        'Private Route Search' as label,
        COUNT(*) as count,
        100 as conversion_rate,
        'private' as ride_type
      FROM trip 
      WHERE request_start_datetime IS NOT NULL ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_new_order' as stage,
        'Private New Order' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM trip WHERE request_start_datetime IS NOT NULL ${dateFilter})) as conversion_rate,
        'private' as ride_type
      FROM trip 
      WHERE status IN ('New Order', 'Pending', 'Accepted', 'In-Transit', 'Completed', 'Counter Offer', 'Just In', 'Trip Ended', 'Waiting Payment') ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_counter_offer' as stage,
        'Private Counter Offer' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM trip WHERE status IN ('New Order', 'Pending', 'Accepted', 'In-Transit', 'Completed', 'Counter Offer', 'Just In', 'Trip Ended', 'Waiting Payment') ${dateFilter})) as conversion_rate,
        'private' as ride_type
      FROM trip 
      WHERE LOWER(status) = 'counter offer' ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_matched' as stage,
        'Private Driver Matched' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM trip WHERE status IN ('New Order', 'Pending', 'Accepted', 'In-Transit', 'Completed', 'Counter Offer', 'Just In', 'Trip Ended', 'Waiting Payment') ${dateFilter})) as conversion_rate,
        'private' as ride_type
      FROM trip 
      WHERE driver_id IS NOT NULL AND driver_id != '0' ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_in_progress' as stage,
        'Private In-Transit' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM trip WHERE driver_id IS NOT NULL AND driver_id != '0' ${dateFilter})) as conversion_rate,
        'private' as ride_type
      FROM trip 
      WHERE LOWER(status) = 'in-transit' ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_trip_ended' as stage,
        'Private Trip Ended' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM trip WHERE status = 'In-Transit' ${dateFilter})) as conversion_rate,
        'private' as ride_type
      FROM trip 
      WHERE LOWER(status) = 'trip ended' ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_completed' as stage,
        'Private Completed' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM trip WHERE status = 'Trip Ended' ${dateFilter})) as conversion_rate,
        'private' as ride_type
      FROM trip 
      WHERE LOWER(status) = 'completed' ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_cancelled' as stage,
        'Private Cancelled' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM trip WHERE status IN ('New Order', 'Pending', 'Accepted', 'In-Transit', 'Completed', 'Counter Offer', 'Just In', 'Trip Ended', 'Waiting Payment') ${dateFilter})) as conversion_rate,
        'private' as ride_type
      FROM trip 
      WHERE LOWER(status) = 'cancelled' ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_waiting_payment' as stage,
        'Private Waiting Payment' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM trip WHERE status = 'Completed' ${dateFilter})) as conversion_rate,
        'private' as ride_type
      FROM trip 
      WHERE LOWER(status) = 'waiting payment' ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_feedback' as stage,
        'Private Feedback Given' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM trip WHERE status = 'Completed' ${dateFilter})) as conversion_rate,
        'private' as ride_type
      FROM trip 
      WHERE status = 'Completed' 
      AND (customer_comment IS NOT NULL AND customer_comment != '' 
           OR driver_comment IS NOT NULL AND driver_comment != ''
           OR driver_stars IS NOT NULL AND driver_stars > 0
           OR customer_stars IS NOT NULL AND customer_stars > 0) ${dateFilter}
      
      UNION ALL
      
      -- Rideshare Driver Overview
      SELECT 
        'rideshare_driver_created' as stage,
        'Rideshare Driver Created' as label,
        COUNT(*) as count,
        100 as conversion_rate,
        'rideshare_driver' as ride_type
      FROM rideshare_trips 
      WHERE created_at IS NOT NULL ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_driver_in_transit' as stage,
        'Rideshare Driver In-Transit' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rideshare_trips WHERE created_at IS NOT NULL ${rideshareDateFilter})) as conversion_rate,
        'rideshare_driver' as ride_type
      FROM rideshare_trips 
      WHERE LOWER(status) = 'in-transit' ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_driver_cancelled' as stage,
        'Rideshare Driver Cancelled' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rideshare_trips WHERE created_at IS NOT NULL ${rideshareDateFilter})) as conversion_rate,
        'rideshare_driver' as ride_type
      FROM rideshare_trips 
      WHERE LOWER(status) = 'cancelled' ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_driver_completed' as stage,
        'Rideshare Driver Completed' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rideshare_trips WHERE created_at IS NOT NULL ${rideshareDateFilter})) as conversion_rate,
        'rideshare_driver' as ride_type
      FROM rideshare_trips 
      WHERE LOWER(status) = 'completed' ${rideshareDateFilter}
      
      UNION ALL
      
      -- Rideshare Passenger Overview
      SELECT 
        'rideshare_passenger_request' as stage,
        'Rideshare Passenger Request' as label,
        COUNT(*) as count,
        100 as conversion_rate,
        'rideshare_passenger' as ride_type
      FROM rideshare_requests 
      WHERE created_at IS NOT NULL ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_passenger_negotiating' as stage,
        'Rideshare Passenger Negotiating' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rideshare_requests WHERE created_at IS NOT NULL ${rideshareDateFilter})) as conversion_rate,
        'rideshare_passenger' as ride_type
      FROM rideshare_requests 
      WHERE LOWER(status) = 'negotiating' ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_passenger_accepted' as stage,
        'Rideshare Passenger Accepted' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rideshare_requests WHERE created_at IS NOT NULL ${rideshareDateFilter})) as conversion_rate,
        'rideshare_passenger' as ride_type
      FROM rideshare_requests 
      WHERE LOWER(status) = 'accepted' ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_passenger_in_transit' as stage,
        'Rideshare Passenger In-Transit' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rideshare_requests WHERE status = 'Accepted' ${rideshareDateFilter})) as conversion_rate,
        'rideshare_passenger' as ride_type
      FROM rideshare_requests 
      WHERE LOWER(status) = 'in-transit' ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_passenger_declined' as stage,
        'Rideshare Passenger Declined' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rideshare_requests WHERE created_at IS NOT NULL ${rideshareDateFilter})) as conversion_rate,
        'rideshare_passenger' as ride_type
      FROM rideshare_requests 
      WHERE LOWER(status) = 'declined' ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_passenger_rejected' as stage,
        'Rideshare Passenger Rejected' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rideshare_requests WHERE created_at IS NOT NULL ${rideshareDateFilter})) as conversion_rate,
        'rideshare_passenger' as ride_type
      FROM rideshare_requests 
      WHERE LOWER(status) = 'rejected' ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_passenger_expired' as stage,
        'Rideshare Passenger Expired' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rideshare_requests WHERE created_at IS NOT NULL ${rideshareDateFilter})) as conversion_rate,
        'rideshare_passenger' as ride_type
      FROM rideshare_requests 
      WHERE LOWER(status) = 'expired' ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_passenger_cancelled' as stage,
        'Rideshare Passenger Cancelled' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rideshare_requests WHERE created_at IS NOT NULL ${rideshareDateFilter})) as conversion_rate,
        'rideshare_passenger' as ride_type
      FROM rideshare_requests 
      WHERE LOWER(status) = 'cancelled' ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_passenger_completed' as stage,
        'Rideshare Passenger Completed' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rideshare_requests WHERE status = 'In-Transit' ${rideshareDateFilter})) as conversion_rate,
        'rideshare_passenger' as ride_type
      FROM rideshare_requests 
      WHERE LOWER(status) = 'passenger completed' ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_passenger_trip_completed' as stage,
        'Rideshare Passenger Trip Completed' as label,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rideshare_requests WHERE status = 'Passenger Completed' ${rideshareDateFilter})) as conversion_rate,
        'rideshare_passenger' as ride_type
      FROM rideshare_requests 
      WHERE LOWER(status) = 'completed' ${rideshareDateFilter}
    `;

    const detailedQuery = `
      -- Private Rides Detailed
      SELECT 
        trip_id,
        status,
        'Private Ride' as ride_type,
        origin_location,
        dest_location,
        distance,
        delivery_cost_proposed,
        accepted_cost,
        request_start_datetime,
        order_start_datetime,
        order_end_datetime,
        customer_comment,
        driver_comment,
        driver_stars,
        customer_stars,
        CASE 
          WHEN LOWER(status) = 'completed' AND (customer_comment IS NOT NULL OR driver_comment IS NOT NULL OR driver_stars > 0 OR customer_stars > 0) THEN 9
          WHEN LOWER(status) = 'completed' THEN 8
          WHEN LOWER(status) = 'waiting payment' THEN 7
          WHEN LOWER(status) = 'trip ended' THEN 6
          WHEN LOWER(status) = 'in-transit' THEN 5
          WHEN LOWER(status) = 'cancelled' THEN 4
          WHEN LOWER(status) = 'counter offer' THEN 3
          WHEN LOWER(status) = 'just in' THEN 2
          WHEN LOWER(status) IN ('new order', 'pending', 'accepted') THEN 1
          ELSE 0
        END as current_stage_index,
        CASE 
          WHEN LOWER(status) = 'completed' THEN order_end_datetime
          ELSE NULL
        END as completed_at,
        CASE 
          WHEN LOWER(status) = 'completed' AND (customer_comment IS NOT NULL OR driver_comment IS NOT NULL OR driver_stars > 0 OR customer_stars > 0) THEN order_end_datetime
          ELSE NULL
        END as feedback_given_at
      FROM trip 
      WHERE request_start_datetime IS NOT NULL ${dateFilter}
      
      UNION ALL
      
      -- Rideshare Driver Detailed
      SELECT 
        rideshare_id as trip_id,
        status COLLATE utf8mb4_unicode_ci as status,
        'Rideshare Driver' COLLATE utf8mb4_unicode_ci as ride_type,
        origin_name COLLATE utf8mb4_unicode_ci as origin_location,
        destination_name COLLATE utf8mb4_unicode_ci as dest_location,
        NULL as distance,
        fare_estimate as delivery_cost_proposed,
        agreed_fare as accepted_cost,
        created_at as request_start_datetime,
        NULL as order_start_datetime,
        updated_at as order_end_datetime,
        NULL as customer_comment,
        NULL as driver_comment,
        NULL as driver_stars,
        NULL as customer_stars,
        CASE 
          WHEN LOWER(status COLLATE utf8mb4_unicode_ci) = 'completed' THEN 3
          WHEN LOWER(status COLLATE utf8mb4_unicode_ci) = 'in-transit' THEN 2
          WHEN LOWER(status COLLATE utf8mb4_unicode_ci) = 'created shared ride request' THEN 1
          ELSE 0
        END as current_stage_index,
        CASE 
          WHEN LOWER(status COLLATE utf8mb4_unicode_ci) = 'completed' THEN updated_at
          ELSE NULL
        END as completed_at,
        NULL as feedback_given_at
      FROM rideshare_trips 
      WHERE created_at IS NOT NULL ${rideshareDateFilter}
      
      UNION ALL
      
      -- Rideshare Passenger Detailed
      SELECT 
        request_id as trip_id,
        status COLLATE utf8mb4_unicode_ci as status,
        'Rideshare Passenger' COLLATE utf8mb4_unicode_ci as ride_type,
        CONCAT(pickup_lat, ',', pickup_lng) COLLATE utf8mb4_unicode_ci as origin_location,
        CONCAT(dropoff_lat, ',', dropoff_lng) COLLATE utf8mb4_unicode_ci as dest_location,
        NULL as distance,
        offer_amount as delivery_cost_proposed,
        accepted_amount as accepted_cost,
        created_at as request_start_datetime,
        NULL as order_start_datetime,
        updated_at as order_end_datetime,
        NULL as customer_comment,
        NULL as driver_comment,
        NULL as driver_stars,
        NULL as customer_stars,
        CASE 
          WHEN LOWER(status COLLATE utf8mb4_unicode_ci) = 'completed' THEN 8
          WHEN LOWER(status COLLATE utf8mb4_unicode_ci) = 'passenger completed' THEN 7
          WHEN LOWER(status COLLATE utf8mb4_unicode_ci) = 'in-transit' THEN 6
          WHEN LOWER(status COLLATE utf8mb4_unicode_ci) = 'accepted' THEN 5
          WHEN LOWER(status COLLATE utf8mb4_unicode_ci) = 'negotiating' THEN 4
          WHEN LOWER(status COLLATE utf8mb4_unicode_ci) = 'join shared ride request' THEN 3
          WHEN LOWER(status COLLATE utf8mb4_unicode_ci) IN ('declined', 'rejected', 'expired', 'cancelled') THEN 2
          ELSE 1
        END as current_stage_index,
        CASE 
          WHEN LOWER(status COLLATE utf8mb4_unicode_ci) = 'completed' THEN updated_at
          ELSE NULL
        END as completed_at,
        NULL as feedback_given_at
      FROM rideshare_requests 
      WHERE created_at IS NOT NULL ${rideshareDateFilter}
      ORDER BY request_start_datetime DESC
      LIMIT 50
    `;

    const metricsQuery = `
      -- Private Rides Metrics
      SELECT 
        'private_search_to_new_order' as metric,
        (COUNT(CASE WHEN LOWER(status) IN ('new order', 'pending', 'accepted', 'in-transit', 'completed', 'counter offer', 'just in', 'trip ended', 'waiting payment') THEN 1 END) * 100.0 / COUNT(*)) as percentage
      FROM trip WHERE request_start_datetime IS NOT NULL ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_new_order_to_counter_offer' as metric,
        (COUNT(CASE WHEN LOWER(status) = 'counter offer' THEN 1 END) * 100.0 / COUNT(CASE WHEN LOWER(status) IN ('new order', 'pending', 'accepted', 'in-transit', 'completed', 'counter offer', 'just in', 'trip ended', 'waiting payment') THEN 1 END)) as percentage
      FROM trip WHERE LOWER(status) IN ('new order', 'pending', 'accepted', 'in-transit', 'completed', 'counter offer', 'just in', 'trip ended', 'waiting payment') ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_new_order_to_match' as metric,
        (COUNT(CASE WHEN driver_id IS NOT NULL AND driver_id != '0' THEN 1 END) * 100.0 / COUNT(CASE WHEN LOWER(status) IN ('new order', 'pending', 'accepted', 'in-transit', 'completed', 'counter offer', 'just in', 'trip ended', 'waiting payment') THEN 1 END)) as percentage
      FROM trip WHERE LOWER(status) IN ('new order', 'pending', 'accepted', 'in-transit', 'completed', 'counter offer', 'just in', 'trip ended', 'waiting payment') ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_match_to_in_transit' as metric,
        (COUNT(CASE WHEN LOWER(status) = 'in-transit' THEN 1 END) * 100.0 / COUNT(CASE WHEN driver_id IS NOT NULL AND driver_id != '0' THEN 1 END)) as percentage
      FROM trip WHERE driver_id IS NOT NULL AND driver_id != '0' ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_in_transit_to_trip_ended' as metric,
        (COUNT(CASE WHEN LOWER(status) = 'trip ended' THEN 1 END) * 100.0 / COUNT(CASE WHEN LOWER(status) = 'in-transit' THEN 1 END)) as percentage
      FROM trip WHERE LOWER(status) = 'in-transit' ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_trip_ended_to_completed' as metric,
        (COUNT(CASE WHEN LOWER(status) = 'completed' THEN 1 END) * 100.0 / COUNT(CASE WHEN LOWER(status) = 'trip ended' THEN 1 END)) as percentage
      FROM trip WHERE LOWER(status) = 'trip ended' ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_completed_to_waiting_payment' as metric,
        (COUNT(CASE WHEN LOWER(status) = 'waiting payment' THEN 1 END) * 100.0 / COUNT(CASE WHEN LOWER(status) = 'completed' THEN 1 END)) as percentage
      FROM trip WHERE LOWER(status) = 'completed' ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'private_completion_to_feedback' as metric,
        (COUNT(CASE WHEN customer_comment IS NOT NULL AND customer_comment != '' OR driver_comment IS NOT NULL AND driver_comment != '' OR driver_stars > 0 OR customer_stars > 0 THEN 1 END) * 100.0 / COUNT(CASE WHEN LOWER(status) = 'completed' THEN 1 END)) as percentage
      FROM trip WHERE LOWER(status) = 'completed' ${dateFilter}
      
      UNION ALL
      
      -- Rideshare Driver Metrics
      SELECT 
        'rideshare_driver_created_to_in_transit' as metric,
        (COUNT(CASE WHEN LOWER(status) = 'in-transit' THEN 1 END) * 100.0 / COUNT(*)) as percentage
      FROM rideshare_trips WHERE created_at IS NOT NULL ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_driver_in_transit_to_completed' as metric,
        (COUNT(CASE WHEN LOWER(status) = 'completed' THEN 1 END) * 100.0 / COUNT(CASE WHEN LOWER(status) = 'in-transit' THEN 1 END)) as percentage
      FROM rideshare_trips WHERE LOWER(status) = 'in-transit' ${rideshareDateFilter}
      
      UNION ALL
      
      -- Rideshare Passenger Metrics
      SELECT 
        'rideshare_passenger_request_to_negotiating' as metric,
        (COUNT(CASE WHEN LOWER(status) = 'negotiating' THEN 1 END) * 100.0 / COUNT(*)) as percentage
      FROM rideshare_requests WHERE created_at IS NOT NULL ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_passenger_negotiating_to_accepted' as metric,
        (COUNT(CASE WHEN LOWER(status) = 'accepted' THEN 1 END) * 100.0 / COUNT(CASE WHEN LOWER(status) = 'negotiating' THEN 1 END)) as percentage
      FROM rideshare_requests WHERE LOWER(status) = 'negotiating' ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_passenger_accepted_to_in_transit' as metric,
        (COUNT(CASE WHEN LOWER(status) = 'in-transit' THEN 1 END) * 100.0 / COUNT(CASE WHEN LOWER(status) = 'accepted' THEN 1 END)) as percentage
      FROM rideshare_requests WHERE LOWER(status) = 'accepted' ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_passenger_in_transit_to_completed' as metric,
        (COUNT(CASE WHEN LOWER(status) = 'passenger completed' THEN 1 END) * 100.0 / COUNT(CASE WHEN LOWER(status) = 'in-transit' THEN 1 END)) as percentage
      FROM rideshare_requests WHERE LOWER(status) = 'in-transit' ${rideshareDateFilter}
      
      UNION ALL
      
      SELECT 
        'rideshare_passenger_completed_to_trip_completed' as metric,
        (COUNT(CASE WHEN LOWER(status) = 'completed' THEN 1 END) * 100.0 / COUNT(CASE WHEN LOWER(status) = 'passenger completed' THEN 1 END)) as percentage
      FROM rideshare_requests WHERE LOWER(status) = 'passenger completed' ${rideshareDateFilter}
    `;

    // Execute all queries
    Promise.all([
      new Promise((resolve, reject) => {
        pool.query(overviewQuery, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        pool.query(detailedQuery, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        pool.query(metricsQuery, (err, results) => {
          if (err) return reject(err);
          const metrics = {};
          results.forEach(row => {
            metrics[row.metric] = parseFloat(row.percentage).toFixed(1);
          });
          resolve(metrics);
        });
      })
    ]).then(([overview, detailed, metrics]) => {
      resolve({
        overview,
        detailed,
        metrics,
        period
      });
    }).catch(err => {
      reject(err);
    });
  });
};





// New method to get trips with feedback data (comments and stars), sorted by most recent first
crudsObj.getTripsWithFeedback = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT trip_id, status, driver_id, cust_id, 
             customer_comment, driver_comment, 
             driver_stars, customer_stars,
             order_end_datetime, origin_location, dest_location, deliveray_details,
             distance, delivery_cost_proposed, accepted_cost
      FROM trip 
      WHERE (customer_comment IS NOT NULL AND customer_comment != '') 
         OR (driver_comment IS NOT NULL AND driver_comment != '')
         OR (driver_stars IS NOT NULL AND driver_stars > 0)
         OR (customer_stars IS NOT NULL AND customer_stars > 0)
      ORDER BY trip_id DESC 
      LIMIT 20`;
    
    pool.query(query, (err, results) => {
      if (err) {
        return reject(err)
      }
      return resolve(results)
    })
  })
}

// New method to get delayed trips where current time is greater than estimate_order_end_datetime
crudsObj.getDelayedTrips = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * 
      FROM trip 
      WHERE estimate_order_end_datetime IS NOT NULL 
      AND NOW() > estimate_order_end_datetime 
      ORDER BY trip_id DESC`;

    pool.query(query, (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};



crudsObj.getTripById = trip_id => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM trip WHERE trip_id = ?',
      [trip_id],
      (err, results) => {
        if (err) {
          return reject(err)
        }
        return resolve(results)
      }
    )
  })
}

crudsObj.getTripByStatusToDriver = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM trip WHERE status = "New Order" ORDER BY trip_id DESC',
      (err, results) => {
        if (err) {
          return reject(err)
        }
        return resolve(results)
      }
    )
  })
}

crudsObj.getTripByStatusToDriverEnd = driver_id => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM trip WHERE status = "Waiting Driver Rating" AND driver_id = ? ORDER BY trip_id DESC',
      [driver_id],
      (err, results) => {
        if (err) {
          return reject(err)
        }
        return resolve(results)
      }
    )
  })
}

crudsObj.getTripByDriverAndStatus = (driver_id, status) => {
  return new Promise((resolve, reject) => {
    const query =
      'SELECT * FROM trip WHERE driver_id = ? AND status = ? ORDER BY trip_id DESC'
    pool.query(query, [driver_id, status], (err, results) => {
      if (err) {
        return reject(err)
      }
      return resolve(results)
    })
  })
}

crudsObj.getTripByCustomerIdAndStatus = (cust_id, status) => {
  return new Promise((resolve, reject) => {
    const query =
      'SELECT * FROM trip WHERE cust_id = ? AND status = ? ORDER BY trip_id DESC'
    pool.query(query, [cust_id, status], (err, results) => {
      if (err) {
        return reject(err)
      }
      return resolve(results)
    })
  })
}

crudsObj.getNumberofTrips = (driver_id, status) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT COUNT(*) AS tripCount FROM trip WHERE driver_id = ? AND status = ?',
      [driver_id, status],
      (err, results) => {
        if (err) {
          return reject(err)
        }
        return resolve(results[0].tripCount)
      }
    )
  })
}

crudsObj.getTripByStatusToCustomer = cust_id => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM trip WHERE cust_id = ? AND (status = "InTransit" OR status = "Waiting customer to end trip" OR status = "New Order") ORDER BY trip_id DESC',
      [cust_id],
      (err, results) => {
        if (err) {
          return reject(err)
        }
        return resolve(results)
      }
    )
  })
}

crudsObj.getTripDetailsOfTablesById = trip_id => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        trip.*, 
        customer_details.*, 
        driver_details.*, 
        customer_driver_chats.*, 
        counter_offer.*, 
        top_up.* 
      FROM 
        trip 
      LEFT JOIN 
        customer_details ON trip.cust_id = customer_details.customerid 
      LEFT JOIN 
        driver_details ON trip.driver_id = driver_details.driver_id 
      LEFT JOIN 
        customer_driver_chats ON trip.trip_id = customer_driver_chats.trip_id 
      LEFT JOIN 
        counter_offer ON trip.trip_id = counter_offer.trip_id 
      LEFT JOIN 
        top_up ON trip.trip_id = top_up.trip_id 
      WHERE 
        trip.trip_id = ?
    `

    pool.query(query, [trip_id], (err, results) => {
      if (err) {
        return reject(err)
      }
      return resolve(results)
    })
  })
}

crudsObj.getIntransitForDriverId = (driver_id, status) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM trip WHERE driver_id = ? AND status = ?'
    pool.query(query, [driver_id, status], (err, results) => {
      if (err) {
        return reject(err)
      }
      return resolve(results)
    })
  })
}

crudsObj.updateTrip = (trip_id, updatedValues) => {
  const {
    driver_id,
    cust_id,
    request_start_datetime,
    order_start_datetime,
    order_end_datetime,
    estimate_order_end_datetime,
    status,
    deliveray_details,
    delivery_notes,
    weight,
    delivery_contact_details,
    dest_location,
    origin_location,
    origin_location_lat,
    origin_location_long,
    destination_lat,
    destination_long,
    distance,
    delivery_cost_proposed,
    accepted_cost,
    paying_when,
    payment_type,
    currency_id,
    currency_code,
    usd_rate,
    customer_comment,
    driver_comment,
    driver_stars,
    customer_stars,
    customer_status,
    pascel_pic1,
    pascel_pic2,
    pascel_pic3,
    trip_priority_type,
    delivery_received_confirmation_code
  } = updatedValues

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE trip SET 
                driver_id = ?, cust_id = ?, request_start_datetime = ?, 
                order_start_datetime = ?, order_end_datetime = ?, estimate_order_end_datetime =?,status = ?, 
                deliveray_details = ?, delivery_notes = ?, weight = ?, delivery_contact_details = ?, 
                dest_location = ?, origin_location = ?, 
                origin_location_lat = ?, origin_location_long = ?, 
                destination_lat = ?, destination_long = ?, 
                distance = ?, delivery_cost_proposed = ?, 
                accepted_cost = ?, paying_when = ?, payment_type = ?, 
                currency_id = ?, currency_code = ?,
                usd_rate = ?, customer_comment = ?, 
                driver_comment = ?, driver_stars = ?, customer_stars = ? , customer_status = ?,
                pascel_pic1 = ?, pascel_pic2 = ?, pascel_pic3 = ?, trip_priority_type = ?, delivery_received_confirmation_code = ?
            WHERE trip_id = ?`,
      [
        driver_id,
        cust_id,
        request_start_datetime,
        order_start_datetime,
        order_end_datetime,
        estimate_order_end_datetime,
        status,
        deliveray_details,
        delivery_notes,
        weight,
        delivery_contact_details,
        dest_location,
        origin_location,
        origin_location_lat,
        origin_location_long,
        destination_lat,
        destination_long,
        distance,
        delivery_cost_proposed,
        accepted_cost,
        paying_when,
        payment_type,
        currency_id,
        currency_code,
        usd_rate,
        customer_comment,
        driver_comment,
        driver_stars,
        customer_stars,
        customer_status,
        pascel_pic1,
        pascel_pic2,
        pascel_pic3,
        trip_priority_type,
        delivery_received_confirmation_code,
        trip_id
      ],
      (err, result) => {
        if (err) {
          return reject(err)
        }
        return resolve({ status: '200', message: 'update successful' })
      }
    )
  })
}

crudsObj.deleteTrip = id => {
  return new Promise((resolve, reject) => {
    pool.query('DELETE FROM trip WHERE trip_id= ?', [id], (err, results) => {
      if (err) {
        return reject(err)
      }
      return resolve(results)
    })
  })
}

crudsObj.updateCustomerComment = (trip_id, updatedValues) => {
  const { customer_comment, driver_stars, status } = updatedValues

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE trip SET 
                customer_comment = ?, 
                driver_stars = ?
            WHERE trip_id = ?`,
      [customer_comment, driver_stars, trip_id],
      (err, result) => {
        if (err) {
          return reject(err)
        }
        return resolve({ status: '200', message: 'update successful' })
      }
    )
  })
}

crudsObj.getMylastTwentyTripsById = (customer_id, driver_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM trip WHERE (cust_id = ? AND cust_id <> "0") OR (driver_id = ? AND driver_id <> "0") ORDER BY trip_id DESC LIMIT 20',
      [customer_id, driver_id],
      (err, results) => {
        if (err) {
          return reject(err)
        }
        return resolve(results)
      }
    )
  })
}

crudsObj.updateDriverComment = (trip_id, updatedValues) => {
  const { driver_comment, customer_stars, status } = updatedValues

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE trip SET 
                driver_comment = ?, 
                customer_stars = ?
            WHERE trip_id = ?`,
      [driver_comment, customer_stars, trip_id],
      (err, result) => {
        if (err) {
          return reject(err)
        }
        return resolve({ status: '200', message: 'update successful' })
      }
    )
  })
}

crudsObj.getTripToDash = status => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM trip WHERE status = ? ORDER BY trip_id DESC',
      [status],
      (err, results) => {
        if (err) {
          return reject(err)
        }
        return resolve(results)
      }
    )
  })
}

crudsObj.updateStatusAndDriver = (trip_id, driver_id, status) => {
  return new Promise((resolve, reject) => {
    // First query: Update trip table
    const updateTripQuery = `
      UPDATE trip SET 
          driver_id = ?, 
          status = ? 
      WHERE trip_id = ?`;
    
    pool.query(updateTripQuery, [driver_id, status, trip_id], (err, result) => {
      if (err) {
        return reject(err);
      }

      // Second query: Update driver_details table
      const updateDriverQuery = `
        UPDATE driver_details SET 
          driving_status = ? 
        WHERE driver_id = ?`;
      
      pool.query(updateDriverQuery, [status, driver_id], (err, result) => {
        if (err) {
          return reject(err); // Reject if there's an error
        }

        // Get current UTC time for database
        const { getCurrentUTC } = require('../utils/timezone');
        const currentUTC = getCurrentUTC();
        const formattedDate = currentUTC.toISOString().slice(0, 19).replace('T', ' ');

        // Third query: Update users table
        const updateUserQuery = `
          UPDATE users SET 
            last_fin_activity_date_time = ? 
          WHERE driver_id = ?`;

        pool.query(updateUserQuery, [formattedDate, driver_id], (err, result) => {
          if (err) {
            return reject(err); // Reject if there's an error
          }

          // Resolve the promise after all queries succeed
          return resolve({ status: '200', message: 'update successful' });
        });
      });
    });
  });
};

crudsObj.endTripByCustomer = trip_id => {
  return new Promise((resolve, reject) => {
    // First, update customer status to 'Ended'
    pool.query(
      `UPDATE trip SET customer_status = 'Ended' WHERE trip_id = ?`,
      [trip_id],
      (err, result) => {
        if (err) {
          return reject(err)
        }

        // Now check if both statuses are 'Ended' to update trip status
        pool.query(
          `UPDATE trip SET status = 'Trip Ended' WHERE trip_id = ? 
           AND customer_status = 'Ended' AND driver_status = 'Ended'`,
          [trip_id],
          (err2, result2) => {
            if (err2) {
              return reject(err2)
            }
            return resolve({
              status: '200',
              message: 'Trip ended successfully'
            })
          }
        )
      }
    )
  })
}

crudsObj.endTripByDriver = (trip_id) => {
  console.log("now here")
  return new Promise((resolve, reject) => {
    // First, update driver status to 'Ended'
    pool.query(
      `UPDATE trip SET driver_status = 'Ended' WHERE trip_id = ?`,
      [trip_id],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        // Now check if both statuses are 'Ended' to update trip status
        pool.query(
          `UPDATE trip SET status = 'Trip Ended' 
           WHERE trip_id = ? 
           AND customer_status = 'Ended' 
           AND driver_status = 'Ended'`,
          [trip_id],
          (err2, result2) => {
            if (err2) {
              return reject(err2);
            }

            // Check if the trip status was updated
            console.log("now here");
            if (result2.affectedRows > 0) {
              // Retrieve the driver_id from the trip table
              pool.query(
                `SELECT driver_id FROM trip WHERE trip_id = ?`,
                [trip_id],
                (err3, result3) => {
                  if (err3) {
                    return reject(err3);
                  }

                  // Assuming only one row is returned
                  const driverId = result3[0]?.driver_id;
                  console.log("Ide", driverId);
                  // Update driver_details only if driverId is found
                  if (driverId) {
                    pool.query(
                      `UPDATE driver_details SET driving_status = 'ready' WHERE driver_id = ?`,
                      [driverId],
                      (err4, result4) => {
                        if (err4) {
                          return reject(err4);
                        }
                        return resolve({ status: '200', result: result4, driver_id: driverId });
                      }
                    );
                  } else {
                    return reject(new Error('Driver ID not found'));
                  }
                }
              );
            } else {
              // If the trip status wasn't updated
              return resolve({ status: '400', message: 'Trip status not updated' });
            }
          }
        );
      }
    );
  });
};

/* ========================
   Billing Preference Methods
======================== */

crudsObj.calculateBillingWithPreference = (userId, distance, account_category) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get user's billing preference
      const usersDb = require('./users');
      const billingPreference = await usersDb.getBillingPreference(userId);
      
      // Get tariffs based on distance and account category
      const tarrifsDb = require('./tarrifs');
      const tariffs = await tarrifsDb.getActiveTarrifByDistance(distance, account_category);
      
      if (tariffs.length === 0) {
        return reject(new Error('No tariff found for given distance and category'));
      }
      
      const tariff = tariffs[0];
      let billingAmount = 0;
      let billingType = billingPreference || 'percentage'; // Default to percentage
      
      if (billingType === 'percentage') {
        // Percentage-based billing: apply rate to base price
        billingAmount = tariff.lower_price_limit * (tariff.rate / 100);
      } else {
        // Daily-based billing: use fixed daily rate
        billingAmount = tariff.rate; // Assuming rate is daily amount
      }
      
      resolve({
        billing_amount: billingAmount,
        billing_type: billingType,
        tariff_used: tariff,
        calculation: {
          base_price: tariff.lower_price_limit,
          rate: tariff.rate,
          billing_preference: billingType
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

crudsObj.updateTripBilling = (tripId, billingData) => {
  return new Promise((resolve, reject) => {
    const {
      billing_amount,
      billing_type,
      commission_calculated,
      driver_earnings
    } = billingData;
    
    pool.query(
      `UPDATE trip 
       SET billing_amount = ?, billing_type = ?, commission_calculated = ?, driver_earnings = ?
       WHERE trip_id = ?`,
      [billing_amount, billing_type, commission_calculated, driver_earnings, tripId],
      (err, result) => {
        if (err) return reject(err);
        if (result.affectedRows === 0) {
          return reject(new Error('Trip not found'));
        }
        resolve({
          status: 200,
          message: 'Trip billing updated successfully',
          trip_id: tripId,
          billing_data: billingData
        });
      }
    );
  });
};

crudsObj.getDriverEarnings = (driverId, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        trip_id,
        billing_amount,
        billing_type,
        commission_calculated,
        driver_earnings,
        order_end_datetime,
        origin_location,
        dest_location
      FROM trip 
      WHERE driver_id = ? 
      AND order_end_datetime BETWEEN ? AND ?
      AND status = 'Completed'
      ORDER BY order_end_datetime DESC
    `;
    
    pool.query(query, [driverId, startDate, endDate], (err, results) => {
      if (err) return reject(err);
      
      // Calculate totals
      const totals = results.reduce((acc, trip) => {
        acc.total_earnings += parseFloat(trip.driver_earnings || 0);
        acc.total_commission += parseFloat(trip.commission_calculated || 0);
        acc.total_trips += 1;
        return acc;
      }, {
        total_earnings: 0,
        total_commission: 0,
        total_trips: 0
      });
      
      resolve({
        trips: results,
        totals: totals
      });
    });
  });
};

crudsObj.getTripsByStatus = (status) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM trip WHERE status = ? ORDER BY trip_id DESC';
    pool.query(query, [status], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = crudsObj
