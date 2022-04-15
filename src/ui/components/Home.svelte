<script lang="ts">
    import {link} from 'svelte-spa-router';
    import { _ } from 'svelte-i18n';
</script>

<a use:link href="/playing?init=true&size=121&tribes=bardur,imperius&mode=domination&online=false&type=sp">Create local SP Game</a>
<a use:link href="/playing?init=true&size=121&tribes=bardur,imperius&mode=domination&online=false&type=mp">Create local MP Game</a>
<a use:link href="/playing?init=true&size=121&tribes=bardur,imperius&mode=domination&online=true&type=mp&token=JWT&with=UUID,UUID">Create online MP Game</a>
<a use:link href="/playing?init=false&load=5fd37f220619434fabb4ef3d808f25ef&online=false&type=sp">Load Local SP Game</a>
<a use:link href="/playing?init=false&load=5fd37f220619434fabb4ef3d808f25ef&online=false&type=mp">Load Local MP Game</a>
<a use:link href="/playing?init=false&load=5fd37f220619434fabb4ef3d808f25ef&online=true&type=mp&token=JWT">Load Online MP game</a>
<a use:link href="/mutliplayer">Mutliplayer</a>
<a use:link href="/singleplayer">Singleplayer</a>