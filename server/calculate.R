
calculate <- function(params) {
    setwd(params$workingDirectory)

    unit.circle <- spatstat::disc(radius = 0.5, centre = c(0.5, 0.5))
    results <- sparrpowR::spatial_power(
        win = unit.circle,
        sim_total = params$simTotal,
        x_case = params$xCases,
        y_case = params$yCases,
        samp_case = "uniform",
        samp_control = "CSR",
        r_case = 0.1,
        n_case = params$nCase,
        n_control = params$nControl,
        cascon = TRUE)

    #svg file sizes are rather large compared to png (too many paths)
    #svg("plot-%d.svg")

    # specifying width and height above default makes plotting area collide with legend
    png(paste0(params$id, ".%d.png"))
    sparrpowR::spatial_plots(results,
            p_thresh = 0.9,
            chars = c(4,5),
            sizes = c(0.6,0.3),
            cols = c("blue", "green", "red", "purple", "orange"))
    dev.off()

    # add generated plots
    files <- list.files(".")
    results$plots <- files[grep(params$id, files)]
    results$id <- params$id

    results
}
