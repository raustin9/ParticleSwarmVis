import argparse
import subprocess


def run_server():
    subprocess.run(["go", "run", "server/server.go"])
    print("running server")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('server', help="Run the server")
    args = parser.parse_args()

    if args.server:
        run_server()
