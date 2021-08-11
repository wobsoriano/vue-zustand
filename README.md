# v-use-clipboard

Clipboard utility for Vue 2 and 3.

## Quick start

Install it:

```bash
npm install v-use-clipboard
```

Use it:

```html
<template>
    <div>
        <div>{{ clipboard }}</div>
        <button @click="setClipboard('hello world')">Copy</button>
    </div>
</template>

<script>
import { defineComponent } from 'vue'; // or @vue/composition-api for Vue 2
import useClipboard from 'v-use-clipboard';

export default defineComponent({
    setup() {
        const [clipboard, setClipboard] = useClipboard();

        return {
            clipboard,
            setClipboard
        }
    }
});
</script>
```