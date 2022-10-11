<template>
  <el-card class="box-card box-card-service">
    <div class="log-content">
      <div :id="id"></div>
    </div>
  </el-card>
</template>

<script>
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import store from 'storejs'
export default {
  name: 'PmExec',
  data () {
    return {}
  },
  methods: {
    getLogWSUrl () {
      const host = window.location.host
      if (this.$utils.protocolCheck() === 'https') {
        return 'wss://' + host
      } else if (this.$utils.protocolCheck() === 'http') {
        return 'ws://' + host
      }
    },
    initTerm () {
      let wsLink = false
      const hostname = this.getLogWSUrl()
      const token = store.get('userInfo').token
      const url = `/api/aslan/environment/environments/${this.envName}/services/${this.serviceName}/pmexec?projectName=${this.projectName}&ip=${this.address}&hostId=${this.hostId}&token=${token}`
      this.ws = new WebSocket(hostname + url)

      this.$nextTick(() => {
        this.term = new Terminal({
          fontSize: '12',
          fontFamily: 'Monaco,Consolas,monospace',
          scrollback: 9999999
        })
        const fitAddon = new FitAddon()
        this.term.loadAddon(fitAddon)
        this.term.open(document.getElementById(this.id))
        this.term.writeln(
          '****************System Message：Connecting To Host****************'
        )
        this.term.onData(data => {
          if (wsLink) {
            this.ws.send(JSON.stringify({ operation: 'stdin', data: data }))
          }
        })

        window.onresize = function () {
          fitAddon.fit()
        }
        this.term.onResize(size => {
          const msg = {
            operation: 'resize',
            cols: size.cols,
            rows: size.rows
          }
          if (wsLink) {
            this.ws.send(JSON.stringify(msg))
          }
        })
        this.ws.onopen = evt => {
          const setEnv = {
            operation: 'stdin',
            data: 'bash \r'
          }
          this.ws.send(JSON.stringify(setEnv))
          this.term.clear()
          this.term.writeln(
            '\u001b[32;1m****************System Message：Host Connection Is Open****************\u001b[0m'
          )
          this.term.writeln(
            'Pass SSH Method to log in to the host for service debugging。(Notice：Connected By Default Shell For Bash)'
          )
          wsLink = true
          fitAddon.fit()
        }
        this.ws.onmessage = evt => {
          this.$nextTick(() => {
            this.term.write(JSON.parse(evt.data).data)
          })
        }
        this.ws.onclose = evt => {
          wsLink = false
          this.$nextTick(() => {
            this.term.writeln(
              '\u001b[31m****************System Message：Host Connection Closed，Please close the window and try again！****************\u001b[0m'
            )
          })
        }
        this.ws.onerror = evt => {
          wsLink = false
          this.$nextTick(() => {
            this.term.writeln(
              `\u001b[31m****************System Message：Encountered An Error ${evt.message} ！！！，Please close the window and try again ****************\u001b[0m`
            )
          })
        }
      })
    }
  },

  props: {
    id: {
      required: true,
      type: String
    },
    visible: {
      required: true,
      type: Boolean
    },
    projectName: {
      required: true,
      type: String
    },
    address: {
      required: true,
      type: String
    },
    envName: {
      required: true,
      type: String
    },
    serviceName: {
      required: true,
      type: String
    },
    hostId: {
      required: true,
      type: String
    }
  },
  mounted () {
    this.initTerm()
  },
  beforeDestroy () {
    this.term.dispose()
    if (typeof this.ws !== 'undefined' && this.ws) {
      this.ws.close()
      delete this.ws
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.initTerm()
      } else {
        if (typeof this.ws !== 'undefined' && this.ws) {
          this.ws.close()
          delete this.ws
        }
        this.term.dispose()
      }
    }
  }
}
</script>

<style lang="less">
.box-card-service {
  .xterm {
    padding: 15px 10px;
  }

  .log-content {
    &::-webkit-scrollbar-track {
      background-color: #f5f5f5;
      border-radius: 6px;
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    }

    &::-webkit-scrollbar {
      width: 8px;
      background-color: #f5f5f5;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #555;
      border-radius: 6px;
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    }

    pre {
      clear: left;
      min-height: 42px;
      margin-top: 0;
      margin-bottom: 0;
      padding-top: 8px;
      color: #f1f1f1;
      font-size: 12px;
      font-family: Monaco, Consolas, monospace;
      line-height: 18px;
      white-space: pre-wrap;
      word-wrap: break-word;
      background-color: #222;
      counter-reset: line-numbering;

      p {
        min-height: 16px;
        margin: 0;
        padding: 0 15px 0 16px;
        cursor: pointer;

        &:hover {
          background-color: #444 !important;
        }
      }
    }
  }

  .el-card__body {
    padding: 0;
  }
}
</style>
