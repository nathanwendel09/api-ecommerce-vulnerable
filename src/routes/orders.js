const router = require('express').Router();
const pool = require('../db');

// Exemplo didatico: identificacao simplificada pelo header X-User-Id.
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'ID inválido' });

    const userId = Number(req.header('X-User-Id'));
    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(401).json({ error: 'Informe o header X-User-Id para identificar o usuario.' });
    }

    const result = await pool.query(
      'SELECT id, user_id, product_id, quantity, status FROM orders WHERE id = $1',
      [id]
    );
    const pedido = result.rows[0];
    if (!pedido) return res.status(404).json({ error: 'Pedido nao encontrado' });

    const usuario = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    const ehAdmin = usuario.rows[0]?.role === 'admin';
    if (pedido.user_id !== userId && !ehAdmin) {
      return res.status(403).json({ error: 'Este pedido pertence a outro usuario.' });
    }

    return res.json(pedido);
  } catch (err) { next(err); }
});
module.exports = router;
