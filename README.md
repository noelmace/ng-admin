# Ng-Admin

An elaborated temporary workaround for Angular CLI enhancements inspired by the devkit-admin in [angular/devkit](https://github.com/angular/devkit).

## Install

`npm i @mace/ng-admin` or `yarn add @mace/ng-admin`

## How to use it

In your project, run `ng-admin <script> [options]`.

## Built-in scripts

### version

Bump the version number in every "library" projects' package.json.

`ng-admin version <version>`

Version should be `minor`, `major`, `patch` or a specific semver version number.

### publish

Publish every builded "library" projects to an npm repository.

`ng-admin publish`

## Create a custom script

In order to add your own script, you can simply add a `<script-name>.ts` file in a `/scripts/` folder at your workspace root.

This file should have a function, defining your script behaviour, as its default export. This function should have the following signature :

`(args: ParsedArgs, logger: logging.Logger): void`

**Warning : your script name can't be the same as a built-in one.**

Once your custom script defined, you can run it with ng-admin as with any built-in script, your TS file name defining the keyword to use.
