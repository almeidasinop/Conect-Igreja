{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.supabase-cli
    pkgs.docker
    pkgs.nodejs_20
    pkgs.deno
    pkgs.xdg-utils
    pkgs.jq
  ];
}