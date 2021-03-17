# 
# 
# helper function to transform coordinates between different reference systems
# transform_coords <- function (dataframe, coordinate_columns = c(1,2), from_crs, to_crs) {
#   sp::coordinates(dataframe) <- coordinate_columns
#   sp::proj4string(dataframe) <- from_crs
#   sp::spTransform(dataframe, to_crs)
# }
# 
# 
# test <- function() {
# us_east_crs <- sp::CRS("+proj=eqearth +lon_0=-77.0028527 +y_0=38.8766482")
# 
# obtain spatial window from dc outline geojson
# geojson_source <- "https://opendata.arcgis.com/datasets/faea4d66e7134e57bf8566197f25b3a8_0.geojson"
# sp_area <- geojsonio::geojson_read(geojson_source,  what = "sp")
# sp_area_union <- maptools::unionSpatialPolygons(sp_area, IDs = rep(1, length(sp_area)))
# 
# geojson_write(sp_area_union, file = "dc.geojson")
# 
# 
# project to local crs
# sp_area_proj <- sp::spTransform(sp_area_union, CRSobj = us_east_crs)
# window <- spatstat::as.owin(sp_area_proj)
# 
# coordinates of case/control cluster(s)
# navy <- transform_coords(
#   data.frame(-77.0028527,38.8766482),
#   from_crs=global_crs,
#   to_crs=us_east_crs
# )@coords
# 
# start_time <- Sys.time() # record start time
# sim_power <- spatial_power(x_case = navy[[1]], y_case = navy[[2]], # center of cluster
#    x_control = navy[[1]], y_control = navy[[2]], # center of cluster
#    n_case = 50, n_control = 950, # sample size of case/control
#    samp_case = "MVN", samp_control = "MVN", # samplers
#    s_case = 1000, s_control = 2000, # approximate size of clusters
#    cascon = FALSE, # power for case cluster(s) only
#    lower_tail = 0.025, upper_tail = 0.975, # two-tailed alpha
#    sim_total = 1, # number of iterations
#    win = window, # study area
#    resolution = 1000, # number gridded knots on x-axis
#    edge = "diggle", # correct for edge effects
#    adapt = FALSE, # fixed-bandwidth
#    h0 = NULL, # automatically select bandwidth for each iteration
#    n_core = 8,
#    verbose = T) # no printout
# end_time <- Sys.time() # record end time
# time_srr <- end_time - start_time # Calculate run time
# 
# 
# pvalprop <- tibble::tibble(x = sim_power$rx, y = sim_power$ry,
#    z = sim_power$pval_prop_cas) # extract proportion significant
# lrr_narm <- na.omit(pvalprop) # remove NAs
# sp::coordinates(lrr_narm) <- ~ x + y # coordinates
# gridded(lrr_narm) <- TRUE # gridded
# pvalprop_raster <- raster::raster(lrr_narm) # convert to raster
# raster::crs(pvalprop_raster) <- us_east_crs
# pvalprop_raster_poly <- raster::rasterToPolygons(pvalprop_raster, dissolve = T) # convert to polygons
# pvalprop_poly_global_proj <- sp::spTransform(pvalprop_raster_poly, global_crs) # unproject (WGS84) 
# 
# 
# 
# jsonlite::write_json(pvalprop_poly_global_proj, "spatial_plot_area.json", force = T, na = "null")
# 
# 
# plot(pvalprop_poly_global_proj)
# }


# helper function to transform coordinates between different reference systems
transform_coords <- function (dataframe, coordinate_columns = c(1,2), from_crs, to_crs) {
  sp::coordinates(dataframe) <- coordinate_columns
  sp::proj4string(dataframe) <- from_crs
  sp::spTransform(dataframe, to_crs)
}

calculate <- function(params) {
    output <- list()
    
    # working directory should be a unique, empty folder
    setwd(params$directory)
    set.seed(as.integer(params$rand_seed))
    
    sp_params = list(
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
        s_case = as.double(unlist(params$s_case, use.names=FALSE)),
        s_control = as.double(unlist(params$s_control, use.names=FALSE)),
        alpha = as.double(params$alpha),
        n_core = 8,
        verbose = FALSE
    )
    
    if (params$gis) {
        
        # determine local coordinate reference system from starting coordinates
        local_crs <- sp::CRS(paste0("+proj=webmerc +datum=WGS84 +lon_0=", params$longitude, " +y_0=", params$latitude))
        global_crs <- sp::CRS("+init=EPSG:4326")
        
        geojson_sp <- geojsonio::geojson_sp(params$geojson)
        sp_area_union <- maptools::unionSpatialPolygons(geojson_sp, IDs = rep(1, length(geojson_sp)))
        sp_area_proj <- sp::spTransform(sp_area_union, CRSobj = local_crs)
        sp_params$win <- spatstat.geom::as.owin(sp_area_proj)
        
        case <- transform_coords(
            data.frame(x = sp_params$x_case,y = sp_params$y_case),
            from_crs=global_crs,
            to_crs=local_crs
        )@coords
        
        control <- transform_coords(
            data.frame(x = sp_params$x_control, y = sp_params$y_control),
            coordinate_columns = c('x', 'y'),
            from_crs = global_crs, 
            to_crs = local_crs
        )@coords
        
        sp_params$x_case = case[,1]
        sp_params$y_case = case[,2]
        sp_params$x_control = control[,1]
        sp_params$y_control = control[,2]
        
    } else {
        if (params$win == "unit_circle") {
            #  actual unit circle is spatstat::disc() # defaults: radius 1, center: 0, 0
            sp_params$win <- spatstat.geom::disc(radius = 0.5, centre = c(0.5, 0.5))
        } else if (params$win == "unit_square") {
            sp_params$win <- spatstat::unit.square()
        } else if (params$win == "rectangle") {
            x1 <- params$x_origin
            x2 <- x1 + params$width
            y1 <- params$y_origin
            y2 <- y1 + params$height
        sp_params$win <- spatstat.geom::owin(c(x1, x2), c(y1, y2))
        } else if (params$win == "circle") {
            x <- params$x_origin
            y <- params$y_origin
            sp_params$win <- spatstat.geom::disc(radius = params$radius, centre = c(x,y))
        }
    }
    
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
    
    # unprojects output in a format suitable for display in leaflet.js
    if (params$gis) {
        gis_results <- plot_gis(results,params)
        results$projected_data <- gis_results
        output$data <- gis_results
    }
    
    # save output file
    saveRDS(results, "results.rds")
    
    # generate plots and return output
    output$plots <- plot_results(results, params)
    output$id <- params$id
    output
}

plot_gis <- function(results, params){

    global_crs <- sp::CRS("+init=EPSG:4326")
    local_crs <- sp::CRS(paste0("+proj=webmerc +datum=WGS84 +lon_0=", params$longitude, " +y_0=", params$latitude))

    # for now, unproject just the pval_prop_case matrix
    # extract proportion significant
    if(as.logical(params$cascon) == TRUE) {
        pvalprop <- data.frame("x" = results$rx, "y" = results$ry, "z" = results$pval_prop_cascon) # case and control clustering
    } else {
        pvalprop <- data.frame("x" = results$rx, "y" = results$ry, "z" = results$pval_prop_cas) # case-only clustering
    }
        
    lrr_narm <- na.omit(pvalprop) # remove NAs
    sp::coordinates(lrr_narm) <- ~ x + y # coordinates
    sp::gridded(lrr_narm) <- TRUE # gridded
    pvalprop_raster <- raster::raster(lrr_narm) # convert to raster
        
    raster::crs(pvalprop_raster) <- local_crs # todo: change to local UTM
        
    # Categorized raster by power threshold into two groups 
    ## Level 1 : Insufficiently powered
    ## Level 2: Sufficiently powered
    pvalprop_raster_reclass <- raster::cut(pvalprop_raster,
                                        breaks = c(-Inf, params$p_thresh, Inf))
        
    pvalprop_raster_poly <- raster::rasterToPolygons(pvalprop_raster_reclass, dissolve = TRUE) # convert to polygons
    pvalprop_poly_global_proj <- sp::spTransform(pvalprop_raster_poly, global_crs) # unproject (WGS84) 
        
    pvalprop_poly_global_proj
}

replot <- function(params) {
  setwd(params$directory)
  output <- list()
  results <- readRDS(params$rds)

  if(params$gis){
    gis_results <- plot_gis(results,params)
    results$projected_data <- gis_results
    output$data <- gis_results
  }

  saveRDS(results, "results.rds")
  output$plots <- plot_results(results, params)
  output
}

plot_results <- function(results, params) {
  # cols[3] (mid_color) is only used when plot_text == TRUE, and is not actually used for legends. 
  # cols[1:3] do not match the order of colors in the documentation
  params$cols <- c(params$insuff_color, params$suff_color, params$case_color, params$control_color)
  params$chars <- as.integer(c(params$case_symbol, params$control_symbol))
  params$sizes <- as.double(c(params$case_size, params$control_size))
  
  # svg files are rather large compared to other formats due to a large number of paths
  svg(filename = "%d.svg")
  sparrpowR::spatial_plots(results,
                           p_thresh = params$p_thresh,
                           chars = params$chars,
                           sizes = params$sizes,
                           plot_pts = params$plot_pts,
                           plot_title = params$title, 
                           cascon = as.logical(params$cascon),
                           plot_axes = params$axes,
                           plot_square = TRUE,
                           horizontal = params$horizontal,
                           cols = params$cols)
  dev.off()
  list.files(pattern = "^\\d+.svg$")
}
