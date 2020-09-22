
calculate <- function(params) {
    output <- list()

    # working directory should be a unique, empty folder
    setwd(params$directory)
    set.seed(as.integer(params$rand_seed))

    if(params$win == "unit_circle") {
        #  actual unit circle is spatstat::disc() # defaults: radius 1, center: 0, 0
        window <- spatstat::disc(radius = 0.5, centre = c(0.5, 0.5))
    } else if(params$win == "unit_square") {
        window <- spatstat::unit.square()
    } else if(params$win == "rectangle") {
        x1 <- params$x_origin
        x2 <- x1 + params$width
        y1 <- params$y_origin
        y2 <- y1 + params$height

        window <- spatstat::owin(c(x1, x2), c(y1, y2))
    } else if(params$win == "circle") {
        x <- params$x_origin
        y <- params$y_origin

        window <- spatstat::disc(radius = params$radius, centre = c(x,y))
    }

    sp_params = list(
        win = window,
        sim_total = as.integer(params$sim_total),
        x_case = as.double(unlist(params$x_case, use.names=FALSE)),
        y_case = as.double(unlist(params$y_case, use.names=FALSE)),
        samp_case = params$samp_case,
        samp_control = params$samp_control,
        x_control = as.double(unlist(params$x_control, use.names=FALSE)),
        y_control = as.double(unlist(params$y_control, use.names=FALSE)),
        n_case = as.integer(unlist(params$n_case, use.names=FALSE)),
        n_control = as.integer(unlist(params$n_control, use.names=FALSE)),
        r_case = as.double(unlist(params$r_case, use.names=FALSE)),
        r_control = as.double(unlist(params$r_control, use.names=FALSE)),
        s_case = as.double(unlist(params$s_case, use.names=FALSE)),
        s_control = as.double(unlist(params$s_control, use.names=FALSE)),
        lower_tail = as.double(params$lower_tail),
        upper_tail = as.double(params$upper_tail),
        n_core = 4
    )

    if(params$sim_total == 1) {
        # additional parameters for spatial_data are ignored
        results <- do.call(sparrpowR::spatial_data, sp_params)
    }

    else if(params$sim_total > 1) {
        results <- do.call(sparrpowR::spatial_power, sp_params)
        s_stat <- t.test(results$s_obs, mu = 1, alternative = "two.sided")
        t_stat <- t.test(results$t_obs, mu = 0, alternative = "two.sided") 

        output$summary <- list(
            mean_n_con = mean(results$n_con),
            mean_n_cas = mean(results$n_cas),
            mean_bandw = mean(results$bandw),
            sd_n_con = sd(results$n_con),
            sd_n_cas = sd(results$n_cas),
            sd_bandw = sd(results$bandw),
            s_test_stat = s_stat$statistic,
            t_test_stat = t_stat$statistic,
            s_pval = s_stat$p.value,
            t_pval = t_stat$p.value
        )
    }

    # save output file
    saveRDS(results, "results.rds")

    # generate plots and return output
    output$plots <- plot_results(results, params)
    output$id <- params$id
    output
}

replot <- function(params) {
    setwd(params$directory)
    results <- readRDS(params$rds)
    list(plots = plot_results(results, params))
}

plot_results <- function(results, params) {
    # cols[3] (mid_color) is only used when plot_text == TRUE, and is not actually used for legends. 
    # cols[1:3] do not match the order of colors in the documentation
    params$cols <- c(params$insuff_color, params$suff_color, params$case_color, params$control_color)
    params$chars <- as.integer(c(params$case_symbol, params$control_symbol))
    params$sizes <- as.integer(c(params$case_size, params$control_size))

    # todo: specifying width and height above default makes plotting area collide with legend
    if (!'plot_format' %in% names(params)) params$plot_format <- "png"
    if (!'plot_width' %in% names(params)) params$plot_width <- 480
    if (!'plot_height' %in% names(params)) params$plot_height <- 480

    # svg files are rather large compared to other formats due to a large number of paths
    # svg width/heights are specified in inches, not pixels

    scale <- sqrt(params$plot_width ^ 2 + params$plot_height ^ 2)/sqrt(480 ^ 2 + 480 ^ 2)

    # set up graphics device
    do.call(params$plot_format, list(
        filename = paste0("plot-%d.", params$plot_format),
        width = params$plot_width, 
        height = params$plot_height
    ))

    sparrpowR::spatial_plots(results,
            p_thresh = params$p_thresh,
            chars = params$chars,
            sizes = params$sizes,
            plot_pts = params$plot_pts,
            plot_title = params$title, 
            cascon = as.logical(params$cascon),
            scale = scale,
            plot_axes = params$axes,
            cols = params$cols)
    dev.off()

    file.rename(paste0("plot-1.",params$plot_format),paste0("simulated-data.",params$plot_format))
    file.rename(paste0("plot-2.",params$plot_format),paste0("local-power-continuous-scale.",params$plot_format))
    file.rename(paste0("plot-3.",params$plot_format),paste0("local-power-above-threshold.",params$plot_format))

    # add generated plots
    files <- list(paste0("simulated-data.",params$plot_format),paste0("local-power-continuous-scale.",params$plot_format),paste0("local-power-above-threshold.",params$plot_format))
    files
}
