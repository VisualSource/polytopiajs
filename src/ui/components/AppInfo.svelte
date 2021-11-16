<style lang="sass">
    footer 
        font-family: "Lucida Grande", Helvetica, Arial, sans-serif
        position: absolute
        bottom: 1px
        left: 1px
        display: flex
        flex-direction: row
        > div 
            margin-left: 0.5rem
            > span 
                margin-left: 0.2rem
    .build 
        color: cyan 
    .lang 
        color: green 
    .online
        color: greenyellow
    .userAgent
        color: gray 
    .vendor
        color: gray
</style>

<footer>
        <div>
            PolytopiaJS Build: <span class="build">{import.meta.env.BUILD_VERSION}</span> 
        </div>
        <div>
            Lang: <span class="lang">{navigator.language}</span> 
        </div>
        <div>
            Online: <span class="online">{navigator.onLine}</span> 
        </div>
        <div>
            UserAgent: <span class="userAgent">{navigator.userAgent}</span> 
        </div>
        <div>
            Vender: <span class="vendor">{navigator.vendor ?? "Unknown"}</span> 
        </div>
</footer>

