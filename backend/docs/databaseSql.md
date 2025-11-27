Clientes em destaque
SELECT
    o.user_id as id,
    u.name as name,
    SUM(o.grand_total) as TotalGasto
FROM
    orders o
INNER JOIN
    users u ON o.user_id = u.id
WHERE
    o.date BETWEEN '2025-02-01' AND '2025-02-02'
GROUP BY
    o.user_id, u.name 
ORDER BY
    TotalGasto DESC
LIMIT 5;

