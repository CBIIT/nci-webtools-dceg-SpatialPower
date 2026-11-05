snapshot <- Sys.getenv("R_PKG_SNAPSHOT")
if (!nzchar(snapshot)) stop("R_PKG_SNAPSHOT is not set; see docker/backend.dockerfile")

pkgs <- c("sf", "terra", "sparrpowR", "spatstat.geom", "jsonlite", "testthat")

# install.packages() only warns on failure and never sets a non-zero exit status, so every step
# below is asserted explicitly. Without this the image builds green and the missing package is
# not discovered until a user hits the request path at runtime.
assert_installed <- function(...) {
  missing <- setdiff(c(...), rownames(installed.packages()))
  if (length(missing)) stop("failed to install: ", paste(missing, collapse = ", "))
}

# Install from the pinned Posit Package Manager binary snapshot configured in Rprofile.site.
# This also pulls in sf's dependency tree (s2, units, classInt, ...).
install.packages(pkgs)
assert_installed(pkgs)

# Then replace only sf with a build compiled against this image's own GDAL.
#
# Posit's prebuilt rhel9 sf binary links libgdal.so.30 (GDAL 3.4), which Amazon Linux 2023 does
# not package at all -- this image ships gdal310 (libgdal.so.36) -- so that binary cannot load
# here and every GIS request fails with "libgdal.so.30: cannot open shared object file".
#
# Three details are load-bearing:
#   * repos must NOT be the bin/linux/... URL used in Rprofile.site. That path serves binaries
#     even from its own .../src/contrib/, so type = "source" is silently ignored there and a
#     binary is installed anyway. PPM's plain /cran/<date> path serves genuine source tarballs.
#   * it is the same snapshot date as the binaries above, so the compiled sf matches the s2 and
#     units it is built against instead of drifting against CRAN HEAD.
#   * dependencies = FALSE keeps those binary dependencies. Building sf's tree from source would
#     drag in s2, which does not compile in this image.
install.packages(
  "sf",
  type = "source",
  repos = sprintf("https://packagemanager.posit.co/cran/%s", snapshot),
  dependencies = FALSE
)
assert_installed("sf")

# Prove the source build actually took effect, in the same layer that produced it, rather than
# leaving it to be discovered later. A failed source build silently restores the previous
# (unusable) binary, which would otherwise still satisfy assert_installed above. Comparing
# against gdal-config rather than a hardcoded version keeps this correct if the image's GDAL
# package is ever changed.
expected <- system2("gdal-config", "--version", stdout = TRUE)
linked <- sf::sf_extSoftVersion()[["GDAL"]]
if (!identical(linked, expected)) {
  stop("sf links GDAL ", linked, " but this image provides ", expected,
       " -- the source build did not take effect")
}
cat("sf built from source against GDAL", linked, "\n")
