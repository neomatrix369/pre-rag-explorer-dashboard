# Troubleshooting

## Browser Compatibility

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support (v15+)
- **Mobile**: Limited (large model downloads)

**Note**: First use of each model downloads it (~23MB for MiniLM, ~33MB for BGE). Subsequent loads use browser cache.

---

## Common Issues

### Model Loading Issues
```bash
# Clear browser cache and reload
# Check browser console for errors
# Ensure stable internet connection for first load
```

### Storage Quota Exceeded
```bash
# Clear collections in Collections Manager
# Or manually clear IndexedDB in browser DevTools
```

### Performance Issues
```bash
# Reduce chunk size for faster processing
# Process fewer methods simultaneously
# Close other browser tabs to free memory
```

### Local setup (contributors)

| Symptom | Fix |
|---------|-----|
| `npm install` peer dependency errors on React 19 | Use current `package-lock.json`; `@testing-library/react@^16.1` — do not use `--legacy-peer-deps` |
| Vitest fails on `sharp` | Should use Vitest stub — run `npm run test`; see [development.md](../contributor-guide/development.md#native-optional-dependencies-rollup-sharp) |
| Port 3000 already in use | Stop `npm run dev` before `./start-services.sh`, or vice versa |
| `git push` fails on tests | Husky runs `npm run test:all`; fix locally or use `git push --no-verify` only when intentional |
