site := "otaku-tracker.surge.sh"

install:
    npm install

dev:
    npm run dev

build:
    npm run build

deploy: build
    surge dist {{site}}

# Build and open local preview
preview: build
    python -m http.server 8000 -d dist
