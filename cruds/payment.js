require('dotenv').config();
const pool = require('./poolfile')

let crudsObj = {};

// Updated postPayment function
crudsObj.postPayment = (
                    payid, 
                    propertyid, 
                    project,
                    daterec,
                    timerec,
                    datefor,
                    description,
                    quantity, 
                    combined_receipt_total_quantity, 
                    amntrec, 
                    amntrec_credit, 
                    interest, 
                    principal, 
                    deposit, 
                    balance, 
                    receipt_ref_dispatch_locked, 
                    feesdue, 
                    username, 
                    confirmed_by, 
                    authorized_by, 
                    branch, 
                    dispatch_status, 
                    dispatch_by, 
                    dispatch_date, 
                    dispatch_time, 
                    dispatched_quantity,
                    undispatched_quantity_remaining, 
                    undispatched_inventory_release_date, 
                    dispatch_sales_shift_id, 
                    sales_shifts_id, 
                    folio,
                    pmode,
                    currency, 
                    price,
                    usd_price,
                    usd_cost_per_unit,
                    credit_repayment_currency_price, 
                    ref,
                    vat_rate_charged, 
                    vat_invoice_no,
                    discount_requisition_id, 
                    discount_amount, 
                    discount_cost, 
                    monthsbehind,
                    movementafterpayment, 
                    suspencebal, 
                    suspencedr,
                    suspencecr,
                    suspencenarration,
                    marketing_media_sale_origin, 
                    marketing_loyalty_structure_id,
                    customerid,
                    comment,
                    sync_status,


) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `INSERT INTO payments (payid, propertyid,project,daterec,timerec,datefor,description,quantity, combined_receipt_total_quantity, amntrec, amntrec_credit, interest, principal, deposit, balance, receipt_ref_dispatch_locked, feesdue, username, confirmed_by, authorized_by, branch, dispatch_status, dispatch_by, dispatch_date, dispatch_time, dispatched_quantity,undispatched_quantity_remaining, undispatched_inventory_release_date, dispatch_sales_shift_id, sales_shifts_id, folio,pmode,currency, price,usd_price,usd_cost_per_unit,credit_repayment_currency_price, ref,vat_rate_charged, vat_invoice_no,discount_requisition_id, discount_amount, discount_cost, monthsbehind,movementafterpayment, suspencebal, suspencedr,suspencecr,suspencenarration,marketing_media_sale_origin, marketing_loyalty_structure_id,customerid,comment,sync_status ) 
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                payid, 
                propertyid, 
                project,
                daterec,
                timerec,
                datefor,
                description,
                quantity, 
                combined_receipt_total_quantity, 
                amntrec, 
                amntrec_credit, 
                interest, 
                principal, 
                deposit, 
                balance, 
                receipt_ref_dispatch_locked, 
                feesdue, 
                username, 
                confirmed_by, 
                authorized_by, 
                branch, 
                dispatch_status, 
                dispatch_by, 
                dispatch_date, 
                dispatch_time, 
                dispatched_quantity,
                undispatched_quantity_remaining, 
                undispatched_inventory_release_date, 
                dispatch_sales_shift_id, 
                sales_shifts_id, 
                folio,
                pmode,
                currency, 
                price,
                usd_price,
                usd_cost_per_unit,
                credit_repayment_currency_price, 
                ref,
                vat_rate_charged, 
                vat_invoice_no,
                discount_requisition_id, 
                discount_amount, 
                discount_cost, 
                monthsbehind,
                movementafterpayment, 
                suspencebal, 
                suspencedr,
                suspencecr,
                suspencenarration,
                marketing_media_sale_origin, 
                marketing_loyalty_structure_id,
                customerid,
                comment,
                sync_status,             
            ],
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ status: '200', message: 'saving successful' });
            }
        );
    });
};

crudsObj.getPaymentsTotalSales = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT SUM(amntrec) AS total_sales FROM payments', (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};
// crudsObj.getPayments = () => {
//     return new Promise((resolve, reject) => {
//         pool.query('SELECT * FROM payments', (err, results) => {
//             if (err) {
//                 return reject(err);
//             }
//             return resolve(results);
//         });
//     });
// };

crudsObj.getPaymentsByBranch = (branch_id, company_id) => {
    const today = getTodayDate();
    return new Promise((resolve, reject) => {
        pool.query(`SELECT SUM(amntrec) AS amnt, SUM(amntrec_credit) AS amnt_credit, COUNT(customerid) AS transaction, SUM(quantity) AS quantity, sales_shifts_id, username, branch_id, company_id FROM payments WHERE (daterec = ? AND branch_id = ? AND company_id = ?)`, [today, branch_id, company_id ], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

crudsObj.getPaymentsSales = () => {
    const today = getTodayDate();
    return new Promise((resolve, reject) => {
        pool.query(`SELECT *, SUM(amntrec) AS total_sales FROM payments`, (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

crudsObj.getPayments = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM payments', (err, results) => {
             if (err) {
                return reject(err);
             }
             return resolve(results);
        });
     });
 };

crudsObj.getPaymentById = (id) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM payments WHERE payid = ?', [id], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

crudsObj.updatePayment = (
    payid, 
    propertyid, 
    project,
    daterec,
    timerec,
    datefor,
    description,
    quantity, 
    combined_receipt_total_quantity, 
    amntrec, 
    amntrec_credit, 
    interest, 
    principal, 
    deposit, 
    balance, 
    receipt_ref_dispatch_locked, 
    feesdue, 
    username, 
    confirmed_by, 
    authorized_by, 
    branch, 
    dispatch_status, 
    dispatch_by, 
    dispatch_date, 
    dispatch_time, 
    dispatched_quantity,
    undispatched_quantity_remaining, 
    undispatched_inventory_release_date, 
    dispatch_sales_shift_id, 
    sales_shifts_id, 
    folio,
    pmode,
    currency, 
    price,
    usd_price,
    usd_cost_per_unit,
    credit_repayment_currency_price, 
    ref,
    vat_rate_charged, 
    vat_invoice_no,
    discount_requisition_id, 
    discount_amount, 
    discount_cost, 
    monthsbehind,
    movementafterpayment, 
    suspencebal, 
    suspencedr,
    suspencecr,
    suspencenarration,
    marketing_media_sale_origin, 
    marketing_loyalty_structure_id,
    customerid,
    comment,
    sync_status
) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE payments SET 
                propertyid = ?, 
                project = ?, 
                daterec = ?, 
                timerec = ?, 
                datefor = ?, 
                description = ?, 
                quantity = ?, 
                combined_receipt_total_quantity = ?, 
                amntrec = ?, 
                amntrec_credit = ?, 
                interest = ?, 
                principal = ?, 
                deposit = ?, 
                balance = ?, 
                receipt_ref_dispatch_locked = ?, 
                feesdue = ?, 
                username = ?, 
                confirmed_by = ?, 
                authorized_by = ?, 
                branch = ?, 
                dispatch_status = ?, 
                dispatch_by = ?, 
                dispatch_date = ?, 
                dispatch_time = ?, 
                dispatched_quantity = ?, 
                undispatched_quantity_remaining = ?, 
                undispatched_inventory_release_date = ?, 
                dispatch_sales_shift_id = ?, 
                sales_shifts_id = ?, 
                folio = ?, 
                pmode = ?, 
                currency = ?, 
                price = ?,  -- Corrected this line
                usd_price = ?, 
                usd_cost_per_unit = ?, 
                credit_repayment_currency_price = ?, 
                ref = ?, 
                vat_rate_charged = ?, 
                vat_invoice_no = ?, 
                discount_requisition_id = ?, 
                discount_amount = ?, 
                discount_cost = ?, 
                monthsbehind = ?, 
                movementafterpayment = ?, 
                suspencebal = ?, 
                suspencedr = ?, 
                suspencecr = ?, 
                suspencenarration = ?, 
                marketing_media_sale_origin = ?, 
                marketing_loyalty_structure_id = ?, 
                customerid = ?, 
                comment = ?,  
                sync_status = ? 
            WHERE payid = ?`,
            [
                propertyid, 
                project, 
                daterec, 
                timerec, 
                datefor, 
                description, 
                quantity, 
                combined_receipt_total_quantity, 
                amntrec, 
                amntrec_credit, 
                interest, 
                principal, 
                deposit, 
                balance, 
                receipt_ref_dispatch_locked, 
                feesdue, 
                username, 
                confirmed_by, 
                authorized_by, 
                branch, 
                dispatch_status, 
                dispatch_by, 
                dispatch_date, 
                dispatch_time, 
                dispatched_quantity, 
                undispatched_quantity_remaining, 
                undispatched_inventory_release_date, 
                dispatch_sales_shift_id, 
                sales_shifts_id, 
                folio, 
                pmode, 
                currency, 
                price, // Ensure this value is included
                usd_price, 
                usd_cost_per_unit, 
                credit_repayment_currency_price, 
                ref, 
                vat_rate_charged, 
                vat_invoice_no, 
                discount_requisition_id, 
                discount_amount, 
                discount_cost, 
                monthsbehind, 
                movementafterpayment, 
                suspencebal, 
                suspencedr, 
                suspencecr, 
                suspencenarration, 
                marketing_media_sale_origin, 
                marketing_loyalty_structure_id, 
                customerid, 
                comment,  
                sync_status,
                payid // Add payid here to match the WHERE clause
            ],
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ status: '200', message: 'Update successful' });
            }
        );
    });
};
crudsObj.deletePayment = (id) => {
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM payments WHERE payid = ?', [id], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; 
};

module.exports = crudsObj;
