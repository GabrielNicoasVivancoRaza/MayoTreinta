// Fabrica de controladores CRUD estandar, reusada por Insumo, Producto, CostoFijo, ExpenseCategory, etc.
export function createCrudController(Model) {
  return {
    async list(req, res) {
      const filter = {};
      if (req.query.activo === 'true') filter.activo = true;
      if (req.query.activo === 'false') filter.activo = false;
      const items = await Model.find(filter).sort({ createdAt: -1 });
      res.json(items);
    },

    async getById(req, res) {
      const item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'No encontrado' });
      res.json(item);
    },

    async create(req, res) {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    },

    async update(req, res) {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!item) return res.status(404).json({ message: 'No encontrado' });
      res.json(item);
    },

    async setActivo(req, res) {
      const item = await Model.findByIdAndUpdate(
        req.params.id,
        { activo: req.body.activo },
        { new: true }
      );
      if (!item) return res.status(404).json({ message: 'No encontrado' });
      res.json(item);
    },

    // Borrado fisico, solo para entidades sin concepto de "activo" (ej. Gasto)
    async remove(req, res) {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ message: 'No encontrado' });
      res.status(204).send();
    },
  };
}
