// ticketHandler.js
require("dotenv").config();
const pool = require("./poolfile");
const usersDbOperations = require("../cruds/users"); 

let ticketCrudsObj = {};

// Function to assign a ticket to the supervisor based on ticket ID
ticketCrudsObj.assignTicketToSupervisor = async (ticketId, userId) => {
    try {
        // Retrieve supervisor details using the user ID
        const supervisor = await usersDbOperations.getFullUserDetailsWithSupervisorTitle(userId);
        
        if (!supervisor) {
            throw new Error("Supervisor not found");
        }

        // Update the ticket with the assigned supervisor
        return await ticketCrudsObj.updateTicket(ticketId, { person_assigned: supervisor.reporting_to_user_id });
    } catch (error) {
        console.error("Error assigning ticket to supervisor:", error);
        throw error; // Rethrow the error for handling in the route
    }
};

// Function to update a ticket
ticketCrudsObj.updateTicket = (ticketId, updatedData) => {
    return new Promise((resolve, reject) => {
        const {
            person_assigned
        } = updatedData;

        pool.query(
            `UPDATE tickets SET person_assigned = ? WHERE conversation_support_id = ?`,
            [person_assigned, ticketId],
            (err, result) => {
                if (err) {
                    console.error("Error updating ticket:", err);
                    return reject(err);
                }
                if (result.affectedRows === 0) {
                    return resolve({
                        status: "404",
                        message: "Ticket not found or no changes made",
                    });
                }
                return resolve({ status: "200", message: "Ticket updated successfully", result });
            }
        );
    });
};

// Export the ticket CRUD object
module.exports = ticketCrudsObj;