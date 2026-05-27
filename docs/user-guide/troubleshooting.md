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
