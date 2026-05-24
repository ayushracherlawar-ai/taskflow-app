import express from "express";
import db from "../db/database.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const tasks = db
      .prepare(
        `
        SELECT * FROM tasks
        WHERE user_id = ?
        ORDER BY created_at DESC
      `
      )
      .all(req.user.id);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tasks"
    });
  }
});

router.post("/", (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      due_date
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required"
      });
    }

    const result = db
      .prepare(
        `
        INSERT INTO tasks (
          title,
          description,
          priority,
          due_date,
          user_id
        )
        VALUES (?, ?, ?, ?, ?)
      `
      )
      .run(
        title,
        description || "",
        priority || "medium",
        due_date || null,
        req.user.id
      );

    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create task"
    });
  }
});

router.put("/:id", (req, res) => {
  try {
    const task = db
      .prepare(
        `
        SELECT * FROM tasks
        WHERE id = ? AND user_id = ?
      `
      )
      .get(req.params.id, req.user.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const {
      title,
      description,
      priority,
      status,
      due_date
    } = req.body;

    db.prepare(
      `
      UPDATE tasks
      SET
        title = ?,
        description = ?,
        priority = ?,
        status = ?,
        due_date = ?
      WHERE id = ? AND user_id = ?
    `
    ).run(
      title,
      description,
      priority,
      status,
      due_date,
      req.params.id,
      req.user.id
    );

    const updatedTask = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(req.params.id);

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update task"
    });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const task = db
      .prepare(
        `
        SELECT * FROM tasks
        WHERE id = ? AND user_id = ?
      `
      )
      .get(req.params.id, req.user.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    db.prepare(
      `
      DELETE FROM tasks
      WHERE id = ? AND user_id = ?
    `
    ).run(req.params.id, req.user.id);

    res.json({
      message: "Task deleted"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete task"
    });
  }
});

export default router;