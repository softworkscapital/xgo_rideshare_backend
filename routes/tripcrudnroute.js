// route
tripRouter.get("/dash/notify/", async (req, res, next) => {
    try {
      let results = await tripDbOperations.getTripToDash();
      res.json(results);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  });

// crud
crudsObj.getTripToDash = () => {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT * FROM trip WHERE status = "InTransit"',
        (err, results) => {
          if (err) {
            return reject(err);
          }
          return resolve(results);
        }
      );
    });
  };