const express = require("express");
const JobTitlesRouter = express.Router();
const JobTitlesDbOperations = require("../cruds/job_title");

// POST a new job title
JobTitlesRouter.post("/", async (req, res) => {
  try {
    const { job_title_name, job_title_grade, job_title_department } = req.body;

    // Validate input
    if (
      !job_title_name ||
      typeof job_title_name !== "string" ||
      job_title_name.trim() === ""
    ) {
      return res.status(400).json({
        error: "job_title_name is required and must be a non-empty string.",
      });
    }

    if (
      !job_title_grade ||
      typeof job_title_grade !== "string" ||
      job_title_grade.trim() === ""
    ) {
      return res.status(400).json({
        error: "job_title_grade is required and must be a non-empty string.",
      });
    }

    if (
      !job_title_department ||
      typeof job_title_department !== "string" ||
      job_title_department.trim() === ""
    ) {
      return res.status(400).json({
        error:
          "job_title_department is required and must be a non-empty string.",
      });
    }

    // Proceed to create the job title
    const results = await JobTitlesDbOperations.postJobTitle(
      job_title_name,
      job_title_grade,
      job_title_department
    );
    res.status(201).json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// GET all job titles
JobTitlesRouter.get("/", async (req, res) => {
  try {
    const results = await JobTitlesDbOperations.getJobTitles();
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// Updated route to get all users in a specific job title group by job_title_group_id
JobTitlesRouter.get(
  "/getallusersinjobtitlegroup/:job_title_group_id",
  async (req, res) => {
    try {
      const jobTitleGroupId = req.params.job_title_group_id;
      const users = await JobTitlesDbOperations.getUsersByJobTitleGroupId(
        jobTitleGroupId
      );

      if (!users.length) {
        return res
          .status(404)
          .json({ message: "No users found for this job title group" });
      }

      res.json(users);
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
    }
  }
);

// GET a job title by ID
JobTitlesRouter.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await JobTitlesDbOperations.getJobTitleById(id);
    if (!result) {
      return res.status(404).json({ message: "Job title not found." });
    }
    res.json(result);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// PUT update a job title
JobTitlesRouter.put("/:job_title_id", async (req, res) => {
  const job_title_id = req.params.job_title_id;
  const updatedValues = req.body;

  try {
    const result = await JobTitlesDbOperations.updateJobTitle(
      job_title_id,
      updatedValues
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error updating job title:", error);
    return res.status(500).json({
      status: "500",
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// DELETE a job title
JobTitlesRouter.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await JobTitlesDbOperations.deleteJobTitle(id);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

JobTitlesRouter.get("/count/departments", async (req, res) => {
  try {
    const result = await JobTitlesDbOperations.countDepartments();
    res.json(result); // Respond with the count of departments
  } catch (error) {
    console.error("Error fetching department count:", error);
    res.sendStatus(500);
  }
});
// GET higher grade job titles
JobTitlesRouter.get("/higher/:job_title_id", async (req, res) => {
  const job_title_id = req.params.job_title_id;

  try {
    const results = await JobTitlesDbOperations.getHigherGradeJobTitles(
      job_title_id
    );
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

module.exports = JobTitlesRouter;
