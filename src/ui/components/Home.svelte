<script lang="ts">
    import {link} from 'svelte-spa-router';
    import { _ } from 'svelte-i18n';
</script>

<a use:link href="/playing">{$_("ui.btn.play")}</a>