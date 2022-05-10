#!/bin/bash

current_date_time="`date +%Y%m%d%H%M%S`";
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[", ]//g')

# Snap

BASEDIR=$(dirname $0)

echo "Version: $PACKAGE_VERSION"

cd $BASEDIR/auryo-snap
ls ../../snap/
git checkout . -f
cp -R ../../snap/* ./snap
sed -i'' -e "s/{VERSION}/$PACKAGE_VERSION/g" ./snap/snapcraft.yaml
echo $current_date_time > triggered_build_at
git add -A
git commit --message "Update for ${PACKAGE_VERSION} - ${current_date_time}"
git push --quiet --set-upstream origin master

# AUR

# cd $BASEDIR/AUR-repo

# MD5=`sha256sum ./release/*.pacman | awk '{ print $1 }'`

# echo "Pacman MD5: $MD5"

# git clone ssh://aur@aur.archlinux.org/auryo-bin.git AUR-repo
# cd AUR-repo
# perl -pi -e "s/[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+)?/$PACKAGE_VERSION/g" PKGBUILD
# perl -pi -e "s/[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+)?/$PACKAGE_VERSION/g" .SRCINFO

# perl -pi -e "s/^[A-Fa-f0-9]{64}$/$MD5/g" PKGBUILD
# perl -pi -e "s/^[A-Fa-f0-9]{64}$/$MD5/g" .SRCINFO

# git add -A
# git commit --message "Travis build $2 for ${PACKAGE_VERSION}"
# git push --quiet --set-upstream origin master

