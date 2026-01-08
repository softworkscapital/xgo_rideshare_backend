require("dotenv").config();
const pool = require("./poolfile");

let jobTitlesObj = {};

jobTitlesObj.postJobTitle = (job_title_name, job_title_grade, job_title_department) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO job_title (job_title_name, job_title_grade, job_title_department) VALUES (?, ?, ?)`,
      [job_title_name, job_title_grade, job_title_department],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: "200", message: "Job title saved successfully", job_title_id: result.insertId });
      }
    );
  });
};

jobTitlesObj.getJobTitles = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM job_title", (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

jobTitlesObj.getJobTitleById = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM job_title WHERE job_title_id = ?",
      [id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        if (results.length === 0) {
          return resolve(null); // No results found
        }
        return resolve(results[0]); // Return the first result
      }
    );
  });
};

jobTitlesObj.updateJobTitle = (job_title_id, updatedValues) => {
  const { job_title_name, job_title_grade, job_title_department } = updatedValues;

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE job_title SET 
        job_title_name = ?, 
        job_title_grade = ?, 
        job_title_department = ? 
      WHERE job_title_id = ?`,
      [job_title_name, job_title_grade, job_title_department, job_title_id],
      (err, result) => {
        if (err) {
          console.error("Error updating job title:", err);
          return reject(err);
        }
        if (result.affectedRows === 0) {
          return resolve({
            status: "404",
            message: "Job title not found or no changes made",
          });
        }
        return resolve({ status: "200", message: "Update successful", result });
      }
    );
  });
};

jobTitlesObj.deleteJobTitle = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM job_title WHERE job_title_id = ?",
      [id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        if (results.affectedRows === 0) {
          return resolve({
            status: "404",
            message: "Job title not found",
          });
        }
        return resolve({ status: "200", message: "Job title deleted successfully" });
      }
    );
  });
};
// New method to get job titles with a higher grade
jobTitlesObj.getHigherGradeJobTitles = (job_title_id) => {
  return new Promise((resolve, reject) => {
    // First, get the grade of the specified job title
    pool.query(
      "SELECT job_title_grade FROM job_title WHERE job_title_id = ?",
      [job_title_id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        if (results.length === 0) {
          return resolve([]); // No job title found with the given ID
        }
        const grade = results[0].job_title_grade;

        // Now, get job titles with a higher grade
        pool.query(
          "SELECT * FROM job_title WHERE job_title_grade < ?",
          [grade],
          (err, higherResults) => {
            if (err) {
              return reject(err);
            }
            return resolve(higherResults);
          }
        );
      }
    );
  });
};
jobTitlesObj.countDepartments = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT COUNT(DISTINCT job_title_department) AS department_count FROM job_title",
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve({ department_count: results[0].department_count });
      }
    );
  });
};

module.exports = jobTitlesObj;