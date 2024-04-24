package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
)

const keyServerAddr = "serveAddr"

type Data struct {
    Iteration int32 `json:"iteration"`
    Inertia float32 `json:"inertia"`
    Cognition float32 `json:"cognition"`
    Social float32 `json:"social"`
    AverageDistance float32 `json:"average_distance_to_shape"`
    Timeout bool `json:"timeout"`
    TotalSteps int32 `json:"total_steps"`
}

func data(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    log.Printf("%s: Endpoint hit: data endpoint", ctx.Value(keyServerAddr))

    body, err := io.ReadAll(r.Body); if err != nil {
        log.Printf("%s: Endpoint /data: Error handling request", ctx.Value(keyServerAddr))
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    var d Data
    err = json.Unmarshal(body, &d)
    if err != nil {
        log.Printf("%s: Endpoint /data: Error unable to parse JSON object", ctx.Value(keyServerAddr))
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    f, _ := os.OpenFile("./server/data.csv", os.O_APPEND|os.O_WRONLY, 0644)
    fmt.Fprintf(f, "%d,%f,%f,%f, %f,%t,%d\n", d.Iteration, d.Inertia, d.Cognition, d.Social, d.AverageDistance, d.Timeout, d.TotalSteps)

    log.Printf("%s: /data: Data: %+v", ctx.Value(keyServerAddr), d)
    fmt.Fprintf(w, "Data: %+v", d)
}

func init_server() {
    router := http.NewServeMux()
    file_server := http.FileServer(http.Dir("./static"))

    router.Handle("/", file_server)
    router.HandleFunc("/data", data)

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
