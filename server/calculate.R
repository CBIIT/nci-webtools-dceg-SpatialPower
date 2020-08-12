
calculate <- function(params) {

    # working directory should be a unique, empty folder
    setwd(params$workingDirectory)

    # todo: allow users to create custom windows
    if(params$win == "unit_circle")
        window <- spatstat::disc(radius = 0.5, centre = c(0.5, 0.5))
    if(params$win == "unit_square")
        window <- spatstat::unit.square()

    output <- sparrpowR::spatial_power(
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
        n_core = 4)

    # save output file
    saveRDS(output, "output.RData")

    #svg file sizes are rather large compared to png (too many paths)
    #svg("plot-%d.svg")

    # specifying width and height above default makes plotting area collide with legend
    png("plot-%d.png")
    sparrpowR::spatial_plots(output,
            p_thresh = params$p_thresh,
            chars = c(0,1),
            sizes = c(1,1),
            plot_pts = params$plot_pts,
            plot_title = params$title, 
            cols = c("blue", "green", "red", "purple", "orange"))
    dev.off()

    # add generated plots
    files <- list.files(".")
    output$id <- params$id
    output$plots <- files[grep("png", files)]
    s_stat <- t.test(output$s_obs, mu = 1, alternative = "two.sided")
    t_stat <- t.test(output$t_obs, mu = 0, alternative = "two.sided") 

    output$summary <- list(
        mean_n_con = mean(output$n_con),
        mean_n_cas = mean(output$n_cas),
        mean_bandw = mean(output$bandw),
        sd_n_con = sd(output$n_con),
        sd_n_cas = sd(output$n_cas),
        sd_bandw = sd(output$bandw),
        s_test_stat = s_stat$statistic,
        t_test_stat = t_stat$statistic,
        s_pval = s_stat$p.value,
        t_pval = t_stat$p.value
    )

    output
}

replot <- function(params) {
    # working directory should be a unique, empty folder
    setwd(params$workingDirectory)

    # save output file
    output <- readRDS("output.RData")

    # specifying width and height above default makes plotting area collide with legend
    png("plot-%d.png")
    sparrpowR::spatial_plots(
            output,
            p_thresh = params$p_thresh,
            chars = c(as.numeric(params$case_symbol),as.numeric(params$control_symbol)),
            sizes = c(params$case_size,params$control_size),
            plot_pts = params$plot_pts,
            plot_title = params$title,
            cols = c(params$insuff_color, params$suff_color, params$mid_color, params$case_color, params$control_color))
    dev.off()

    # add generated plots
    files <- list.files(".")
    output$plots <- files[grep("png", files)]
    output
}
