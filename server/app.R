
calculate <- function(params) {
    output <- list()

    # working directory should be a unique, empty folder
    setwd(params$directory)
    set.seed(params$rand_seed)

    if(params$win == "unit_circle") {
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
        sim_total = params$sim_total,
        x_case = params$x_case,
        y_case = params$y_case,
        samp_case = params$samp_case,
        samp_control = params$samp_control,
        x_control = params$x_control,
        y_control = params$y_control,
        n_case = params$n_case,
        n_control = params$n_control,
        npc_control = params$npc_control,
        r_case = params$r_case,
        r_control = params$r_control,
        s_case = params$s_case,
        s_control = params$s_control,
        l_case = params$l_case,
        l_control = params$l_control,
        e_control = params$e_control,
        lower_tail = params$lower_tail,
        upper_tail = params$upper_tail,
        cascon = params$cascon,
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
    params$cols <- c("blue", "green", "red", "purple", "orange")
    params$chars <- c(0,1)
    params$sizes <- c(1,1)
    params$plot_format <- "png"
    params$plot_width <- 480
    params$plot_height <- 480

    output$plots <- plot_results(results, params)
    output$id <- params$id
    output
}

replot <- function(params) {
    setwd(params$directory)
    if (!'plot_format' %in% names(params)) params$plot_format <- "png"
    if (!'plot_width' %in% names(params)) params$plot_width <- 480
    if (!'plot_height' %in% names(params)) params$plot_height <- 480

    # Note: cols[3] (mid_color) is only used when plot_text == TRUE, and is not actually used for legends. 
    # cols[1:3] do not match the order of colors in the documentation
    params$cols <- c(params$insuff_color, params$suff_color, params$mid_color, params$case_color, params$control_color)
    params$chars <- c(as.integer(params$case_symbol), as.integer(params$control_symbol))
    params$sizes <- c(as.integer(params$case_size), as.integer(params$control_size))

    results <- readRDS(params$rds)
    list(plots = plot_results(results, params))
}

plot_results <- function(results, params) {
    # todo: specifying width and height above default makes plotting area collide with legend
    
    # note: svg files are rather large compared to other formats due to a large number of paths
    # also, svg width/heights are specified in inches, not pixels

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
            cols = params$cols)
    dev.off()

    # add generated plots
    files <- list.files(".")
    files[grep(params$plot_format, files)]
}
