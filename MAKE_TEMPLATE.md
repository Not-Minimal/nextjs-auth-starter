# 📦 Cómo Convertir Este Proyecto en una Plantilla de GitHub

Esta guía te ayudará a preparar y publicar este proyecto como una plantilla de GitHub reutilizable.

---

## 🎯 Pasos para Crear la Plantilla

### 1. Limpiar Datos Sensibles

Antes de subir el proyecto, asegúrate de que NO contenga datos sensibles:

```bash
# Verifica que .env, .env.local están en .gitignore
cat .gitignore | grep ".env"

# Elimina archivos sensibles si existen en el repo
git rm --cached .env .env.local 2>/dev/null || true

# Verifica que no hay credenciales en el código
grep -r "GITHUB_CLIENT_SECRET" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next
grep -r "GOOGLE_CLIENT_SECRET" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next
```

### 2. Actualizar README Principal

Renombra el README de la plantilla:

```bash
# Respalda el README actual si lo necesitas
mv README.md README_OLD.md

# Usa el README de la plantilla
mv README_TEMPLATE.md README.md
```

### 3. Verificar Archivos Esenciales

Asegúrate de que estos archivos existen:

- ✅ `.env.example` - Variables de entorno de ejemplo
- ✅ `.gitignore` - Archivos a ignorar
- ✅ `README.md` - Documentación principal
- ✅ `QUICK_START.md` - Guía de inicio rápido
- ✅ `TROUBLESHOOTING.md` - Solución de problemas
- ✅ `package.json` - Dependencias y scripts
- ✅ `prisma/schema.prisma` - Schema de base de datos
- ✅ `.github/workflows/ci.yml` - CI/CD

### 4. Limpiar Archivos No Necesarios para la Plantilla

```bash
# Elimina archivos de desarrollo local
rm -rf .next
rm -rf node_modules
rm -rf .pnpm-store

# Elimina archivos de documentación temporal (opcionales)
rm -f MAKE_TEMPLATE.md
rm -f SESSION_SUMMARY_DEC25.md
rm -f CLEAN_INSTALL_SUMMARY.md
rm -f FIX_PRISMA_ERROR_SUMMARY.md
rm -f FIX_VERIFICATION_UPDATED_AT.md
rm -f OAUTH_FIXES_COMPLETE.md

# O muévelos a una carpeta de docs si quieres conservarlos
mkdir -p docs/development
mv *_SUMMARY*.md docs/development/ 2>/dev/null || true
mv FIX_*.md docs/development/ 2>/dev/null || true
```

### 5. Crear Repositorio en GitHub

#### Opción A: Nuevo Repositorio

1. Ve a [GitHub](https://github.com/new)
2. Crea un nuevo repositorio:
   - **Nombre**: `nextjs-auth-starter` (o el nombre que prefieras)
   - **Descripción**: "Next.js 16 starter template with Better Auth, Prisma 7, and OAuth"
   - **Visibilidad**: Public (para que otros puedan usar la plantilla)
   - ⚠️ **NO** inicialices con README, .gitignore o licencia (ya los tienes)
3. Copia la URL del repositorio

#### Opción B: Usar el Repositorio Actual

Si ya tienes un repositorio local:

```bash
# Verifica el remote actual
git remote -v

# Si no hay remote o quieres cambiar
git remote remove origin  # Solo si existe
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
```

### 6. Preparar Git

```bash
# Inicializa git si no está inicializado
git init

# Agrega todos los archivos
git add .

# Crea el primer commit
git commit -m "Initial commit: Next.js Auth Starter Template

✨ Features:
- Next.js 16 with App Router
- Better Auth with OAuth (GitHub & Google)
- Prisma 7 with PostgreSQL adapter
- TypeScript strict mode
- Tailwind CSS 4
- Full documentation
"

# Crea la rama main
git branch -M main
```

### 7. Subir a GitHub

```bash
# Push al repositorio
git push -u origin main
```

### 8. Configurar como Plantilla en GitHub

1. Ve a tu repositorio en GitHub
2. Clic en **Settings** (⚙️)
3. En la sección **General**, busca **Template repository**
4. ✅ Marca la casilla **"Template repository"**
5. Guarda los cambios

¡Listo! Ahora tu repositorio es una plantilla.

---

## 🎨 Personalización Opcional

### Agregar Temas de GitHub

Crea `.github/ISSUE_TEMPLATE/bug_report.md`:

```yaml
---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS]
 - Node version: [e.g. 20.10.0]
 - pnpm version: [e.g. 8.14.0]

**Additional context**
Add any other context about the problem here.
```

### Agregar Licencia

Crea `LICENSE`:

```text
MIT License

Copyright (c) 2024 [Tu Nombre]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Agregar Badges al README

Actualiza el README con badges relevantes:

```markdown
[![GitHub stars](https://img.shields.io/github/stars/TU_USUARIO/TU_REPO)](https://github.com/TU_USUARIO/TU_REPO/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/TU_USUARIO/TU_REPO)](https://github.com/TU_USUARIO/TU_REPO/network)
[![GitHub issues](https://img.shields.io/github/issues/TU_USUARIO/TU_REPO)](https://github.com/TU_USUARIO/TU_REPO/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

---

## 🚀 Cómo Usar la Plantilla

Una vez publicada, tú u otros usuarios pueden usar la plantilla así:

### Método 1: Usar en GitHub

1. Ve al repositorio de la plantilla
2. Clic en **"Use this template"** (botón verde)
3. Elige un nombre para tu nuevo proyecto
4. Clic en **"Create repository"**
5. Clona tu nuevo repositorio
6. Sigue las instrucciones en `QUICK_START.md`

### Método 2: Clonar Manualmente

```bash
# Clonar
git clone https://github.com/TU_USUARIO/nextjs-auth-starter.git mi-nuevo-proyecto
cd mi-nuevo-proyecto

# Remover el remote de la plantilla
git remote remove origin

# Agregar tu propio remote
git remote add origin https://github.com/TU_USUARIO/mi-nuevo-proyecto.git

# Instalar y configurar
pnpm install
cp .env.example .env.local
# ... seguir QUICK_START.md
```

---

## 📋 Checklist Final

Antes de publicar, verifica:

- [ ] `.env` y `.env.local` NO están en el repositorio
- [ ] `.env.example` existe y está actualizado
- [ ] README.md es claro y completo
- [ ] Todas las credenciales de desarrollo fueron removidas
- [ ] `.gitignore` está correctamente configurado
- [ ] `package.json` tiene la información correcta
- [ ] La documentación está completa
- [ ] El proyecto se puede clonar e instalar limpiamente
- [ ] Las instrucciones de `QUICK_START.md` funcionan
- [ ] GitHub Actions (CI) está configurado
- [ ] El repositorio está marcado como "Template repository"

---

## 🎯 Prueba de la Plantilla

Antes de publicar oficialmente, prueba que funciona:

```bash
# En otro directorio
cd /tmp
git clone https://github.com/TU_USUARIO/TU_REPO.git test-template
cd test-template

# Sigue QUICK_START.md exactamente como lo haría un usuario nuevo
pnpm install
cp .env.example .env.local
# ... editar .env.local con valores de prueba
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev
```

Si todo funciona sin errores, ¡tu plantilla está lista! ✅

---

## 📣 Promoción de la Plantilla

### Compartir en la Comunidad

1. **Twitter/X**: "🚀 Just released a Next.js 16 starter template with Better Auth, Prisma 7, and OAuth pre-configured!"
2. **Reddit**: r/nextjs, r/webdev
3. **Dev.to**: Escribe un artículo sobre la plantilla
4. **Product Hunt**: Lanza la plantilla
5. **GitHub Topics**: Agrega topics relevantes a tu repo:
   - `nextjs`
   - `nextjs-template`
   - `authentication`
   - `prisma`
   - `oauth`
   - `typescript`
   - `starter-template`

### Agregar Topics en GitHub

1. Ve a tu repositorio
2. Clic en el ⚙️ junto a "About"
3. Agrega topics relevantes
4. Agrega una descripción corta y website (si tienes)

---

## 🔄 Mantener la Plantilla

### Actualizaciones Regulares

```bash
# Actualiza dependencias periódicamente
pnpm update --latest

# Verifica que todo sigue funcionando
pnpm prisma generate
pnpm build

# Commit y push
git add .
git commit -m "chore: update dependencies"
git push
```

### Versiones

Usa tags de Git para versiones:

```bash
git tag -a v1.0.0 -m "Version 1.0.0 - Initial stable release"
git push origin v1.0.0
```

### Changelog

Mantén un `CHANGELOG.md`:

```markdown
# Changelog

## [1.0.0] - 2024-12-25

### Added
- Initial release
- Next.js 16 with App Router
- Better Auth integration
- Prisma 7 with PostgreSQL adapter
- OAuth (GitHub & Google)
- Full documentation

### Changed
- N/A

### Fixed
- N/A
```

---

## 🆘 Soporte

Si otros usuarios tienen problemas:

1. Anímales a abrir **Issues** en GitHub
2. Crea una sección de **Discussions** en el repo
3. Responde preguntas comunes en el README
4. Actualiza `TROUBLESHOOTING.md` con nuevos problemas

---

## ✅ Resultado Final

Tu repositorio ahora debería verse así en GitHub:

```
TU_USUARIO/nextjs-auth-starter
├── 🏷️ [Template] badge
├── ⭐ Stars
├── 🔱 Forks
├── 📄 README.md (completo y atractivo)
├── 📚 Documentación completa
├── 🚀 Botón "Use this template"
└── ✅ CI/CD configurado
```

**¡Felicitaciones! Tu plantilla está lista para ser usada por la comunidad.** 🎉

---

*Creado: Diciembre 2024*
*Autor: Stories of Software*