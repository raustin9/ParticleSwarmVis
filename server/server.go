package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
)

const keyServerAddr = "serveAddr"

func hello_world(w http.ResponseWriter, r *http.Request) {
    if r.Method != "GET" {
        http.Error(w, "Method is not supported.", http.StatusNotFound)
        return
    }
    
    ctx := r.Context()

    log.Printf("%s: Endpoint hit: '/'\n", ctx.Value(keyServerAddr))
    fmt.Fprintf(w, "%s: Homepage endpoint", ctx.Value(keyServerAddr))
}


func init_server() {
    router := http.NewServeMux()
    file_server := http.FileServer(http.Dir("./static"))

    router.Handle("/", file_server)

    ctx, cancel_ctx := context.WithCancel(context.Background())

    server_one := &http.Server {
        Addr: ":8080",
        Handler: router,
        BaseContext: func (l net.Listener) context.Context {
            ctx = context.WithValue(ctx, keyServerAddr, l.Addr().String())
            return ctx
        },
    }

    go func() {
        log.Fatal(server_one.ListenAndServe())
        cancel_ctx()
    } ()

    <-ctx.Done()
}

func main() {
    fmt.Println("Starting server on port 8080")

    init_server()
}
