# ✅ Checklist: Convertir a Plantilla de GitHub

## 📋 Pasos Mínimos (15 minutos)

### 1. Limpiar
```bash
rm -rf .next node_modules .pnpm-store
```

### 2. Actualizar README
```bash
mv README.md README_OLD.md
mv README_TEMPLATE.md README.md
```

### 3. Verificar .env
- [ ] `.env` y `.env.local` NO están en el repo
- [ ] `.env.example` existe ✅

### 4. Git
```bash
git add .
git commit -m "feat: initial template"
```

### 5. GitHub
1. Crear repo: https://github.com/new
2. Push código
3. Settings → Marcar "Template repository" ✅

## 📚 Archivos Incluidos

- ✅ `.env.example` - Variables de ejemplo
- ✅ `README_TEMPLATE.md` - README para la plantilla
- ✅ `QUICK_START.md` - Guía de inicio
- ✅ `TROUBLESHOOTING.md` - Solución de problemas
- ✅ `PRISMA_7_SETUP.md` - Configuración Prisma 7
- ✅ `OAUTH_SETUP_GUIDE.md` - Guía OAuth
- ✅ `CONVERT_TO_TEMPLATE.md` - Esta guía
- ✅ `.github/workflows/ci.yml` - CI/CD

## 🎯 Resultado

Tu plantilla permitirá a otros:
1. Clic en "Use this template"
2. Seguir `QUICK_START.md`
3. Tener autenticación funcionando en 5 minutos

## 📖 Docs Detalladas

- **Rápido**: `CONVERT_TO_TEMPLATE.md`
- **Completo**: `MAKE_TEMPLATE.md`

¡Listo para publicar! 🚀
